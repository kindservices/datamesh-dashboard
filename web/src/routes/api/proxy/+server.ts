import { type RequestHandler } from '@sveltejs/kit'
import { json, text } from '@sveltejs/kit'

const debugResponse = async (url, response) => {

  console.log(`request returning ${response.status} from ${url}`, response)
  console.error(`response bodyUsed?: ${response.bodyUsed}`)
  const body = await response.text()
  console.error(`>response>${body}<response<`)

  return body
}

/**
 * The POST body is expected to send:
 * 
 * {
 *   proxy : "url string",
 *   method : GET | POST | PUT | DELETE
 *   body : <content>
 *   headers : {}
 * }
 * @param event 
 * @see https://kit.svelte.dev/docs/routing#server
 * @returns the proxied response
 */
export const POST: RequestHandler = async (event) => {

  console.log(`handling proxy request...`)
  console.time('proxyHandler')

  try {
    const proxyMessage = await event.request.json()
    var bodyContent = proxyMessage.body
    try {
      const parsedJason = JSON.parse(bodyContent)
      bodyContent = parsedJason
    } catch (e) {
      console.log(`.....calling parse on >>${bodyContent}<< threw: ${e}`)
    }
    
    const proxyRequest = {
      method: proxyMessage.method ?? "POST",
      body: proxyMessage.method == "GET" ? null : bodyContent,
      headers: proxyMessage.headers
    }
  
    console.log(`making proxy request to ${proxyMessage.proxy} with ${typeof(bodyContent)} body content ${bodyContent}`)
    console.log(`>>>${JSON.stringify(proxyRequest, null, 2)}<<<`)
  
    const response = await fetch(proxyMessage.proxy, {
      method: proxyMessage.method ?? "POST",
      body: proxyMessage.method == "GET" ? null : JSON.stringify(bodyContent),
      headers: proxyMessage.headers
    })

    const body = await debugResponse(proxyMessage.proxy, response)

    return {
      body: body,
      status: response.status,
      headers: response.headers
    }
  } finally {
    console.timeEnd('proxyHandler')
  }
}