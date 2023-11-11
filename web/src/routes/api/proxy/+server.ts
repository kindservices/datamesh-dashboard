import { type RequestHandler } from '@sveltejs/kit'
import { json, text } from '@sveltejs/kit'

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

  const jsonBody = await event.request.text()

  console.log(`jason: ${jsonBody}`)

  const jason = JSON.parse(jsonBody)


  const proxyRequest = {
    method: jason.method ?? "POST",
    body: jason.method == "GET" ? null : jason.body,
    headers: jason.headers,
  }

  console.log(`making proxy request to ${jason.proxy}: ${JSON.stringify(proxyRequest, null, 2)}`)

  const response = await fetch(jason.proxy, proxyRequest);

  console.timeEnd('proxyHandler')
  console.log(`returning ${response.status} from ${jason.proxy}`)

  return response
}