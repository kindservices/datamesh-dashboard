//> using scala "3.3.1"
//> using lib "com.lihaoyi::requests:0.8.0"
//> using lib "com.lihaoyi::cask:0.9.1"
//> using lib "com.lihaoyi::upickle:3.0.0"

import cask.model.Response
import ujson.Value
import util.control.NonFatal

import java.util.concurrent.{Executors, ScheduledExecutorService, TimeUnit}
import scala.concurrent.ExecutionContext

// format: off
/**
  * This "backend for front-end" is the caching layer between our dashboard and the service registry.
  * 
  * It periodically refreshed its state
  *
  * GET /component 
  * 
  * returns:

  [
    {
        "id": "testOne",
        "label": "some friendly label",
        "secondsSinceLastHeartbeat": 1174,
        "isStale": true
    },
    {
        "id": "testHeartbeat",
        "label": "some friendly label",
        "secondsSinceLastHeartbeat": 1097,
        "isStale": true
    }
]
  */
// format: on
def env(key: String, default: String = null) =
  def bang = sys.error(
    s"$key env variable not set: ${sys.env.mkString("\n", "\n", "\n")}\n properties:\n ${sys.props.mkString("\n")}"
  )

  sys.env.get(key).orElse(Option(default)).getOrElse(bang)

import upickle.*
import upickle.default.{macroRW, ReadWriter as RW, *}

import java.time.*
import java.time.format.*
import scala.util.*
import scala.util.Properties.*

object serviceregistry {

  case class WebComponent(jsUrl: String, cssUrl: String, componentId: String)

  object WebComponent {
    given rw: RW[WebComponent] = macroRW

    def example = WebComponent("path/to/component.js", "path/to/component.css", "comp-onent")
  }

  given RW[ZonedDateTime] = readwriter[String].bimap[ZonedDateTime](
    zonedDateTime => DateTimeFormatter.ISO_INSTANT.format(zonedDateTime),
    str => ZonedDateTime.from(DateTimeFormatter.ISO_DATE_TIME.parse(str))
  )

  /** The register request body */
  case class Register(
      webComponent: WebComponent,
      label: String,
      tags: Map[String, String] = Map.empty
  )

  object Register {
    given rw: RW[Register] = macroRW

    def example = Register(
      WebComponent.example,
      "some friendly label",
      Map("env" -> "prod", "createdBy" -> "somebody")
    )
  }

  case class ListResponse(id: String, service: Register, lastUpdated: ZonedDateTime)
  object ListResponse {
    given rw: RW[ListResponse] = macroRW
  }
}

object model {
  case class Component(id: String, label: String, secondsSinceLastHeartbeat: Long, isStale: Boolean)
  object Component {
    given rw: RW[Component] = macroRW
  }
}

import serviceregistry.{*, given}

object conf {
  private def registryHostPort: String = env("REGISTRY_HOSTPORT", "http://localhost:8080")

  def listUrl = s"${registryHostPort}/api/v1/registry"
}

def fetch(url: String) = {
  println(s"fetching $url")
  val response = requests.get(url)
  response
    .ensuring(_.statusCode == 200, s"${conf.listUrl} returned ${response.statusCode}: $response")
    .text()
}

def listComponents(url: String = conf.listUrl): Seq[ListResponse] = try {
  read[List[ListResponse]](fetch(url))
} catch {
  case NonFatal(e) => throw new Exception(s"Error fetching '$url'", e)
}

object App extends cask.MainRoutes {

  extension (time: ZonedDateTime) {
    def elapsedMillis(now: ZonedDateTime): Long =
      now.toInstant.toEpochMilli - time.toInstant.toEpochMilli
    def elapsedSeconds(now: ZonedDateTime): Long = time.elapsedMillis(now) / 1000
  }

  private object cache {
    private var lastUpdated                   = ZonedDateTime.now()
    private var components: Seq[ListResponse] = listComponents()

    private val scheduler         = Executors.newScheduledThreadPool(1)
    private val cacheAgeInSeconds = env("CACHE_AGE", "5").toInt

    scheduler.scheduleAtFixedRate(
      () => {
        components = listComponents()
        lastUpdated = ZonedDateTime.now()
      },
      cacheAgeInSeconds,
      cacheAgeInSeconds,
      TimeUnit.SECONDS
    )

    def get(id: String): Option[ListResponse] = components.find(_.id == id)

    def getJavascript(id: String) = get(id).map { c =>
      fetch(c.service.webComponent.jsUrl)
    }

    def getCSS(id: String) = get(id).map { c =>
      fetch(c.service.webComponent.cssUrl)
    }

    def list(now: ZonedDateTime = ZonedDateTime.now()): Seq[model.Component] = {
      components.map { c =>
        val seconds = c.lastUpdated.elapsedSeconds(now)
        model.Component(c.id, c.service.label, seconds, seconds > 15)
      }
    }
  }

  def msg(text: String) = writeJs(Map("message" -> text))
  def reply(body: ujson.Value = ujson.Null, statusCode: Int = 200) = cask.Response(
    data = body,
    statusCode = statusCode,
    headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "application/json")
  )

  @cask.get("/")
  def getPoorMansOpenAPI() = cask.Response(
    data = s"""
    <html>
    <ul>
  <li><a href="/health">GET /health</a></li>
  <li>GET /component/:id/bundle.js <-- get a web component's javascript</li>
  <li>GET /component/:id/bundle.css <-- get a component's css</li>
  <li><a href="/component">GET /component</a> <-- list components</li>
  </ul>
  </html>
  """,
    statusCode = 200,
    headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "text/html")
  )

  @cask.getJson("/component")
  def list() = reply(writeJs(cache.list()))

  @cask.get("/component/:id/:fileName")
  def get(id: String, fileName: String) = {
    fileName match {
      case "bundle.js" =>
        cache.getJavascript(id) match {
          case Some(js) =>
            cask.Response(
              data = js,
              headers = Seq(
                "Access-Control-Allow-Origin" -> "*",
                "Content-Type"                -> "application/javascript"
              )
            )
          case None => cask.Response("not found", statusCode = 404)
        }
      case "bundle.css" =>
        cache.getCSS(id) match {
          case Some(css) =>
            cask.Response(
              data = css,
              headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "text/plain")
            )
          case None => cask.Response("not found", statusCode = 404)
        }
      case other =>
        cask.Response(
          s"ignoring '$other'. specify bundle.js or bundle.css, e.g /component/$id/bundle.js",
          statusCode = 501
        )
    }
  }

  @cask.getJson("/component/:id")
  def getComponent(id: String) = {
    cache.get(id) match {
      case Some(c) => reply(writeJs(c))
      case None    => reply(statusCode = 404)
    }
  }

  @cask.get("/health")
  def getHealthCheck() = s"${ZonedDateTime.now(ZoneId.of("UTC"))}"

  override def host: String = "0.0.0.0"

  override def port = envOrElse("PORT", propOrElse("PORT", 8081.toString)).toInt

  initialize()

  println(
    s""" 🚀 running Dashboard BFF on $host:$port {verbose : $verbose, debugMode : $debugMode }  🚀"""
  )
}
