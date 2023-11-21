import { type RequestHandler } from '@sveltejs/kit'
import { json, text } from '@sveltejs/kit'

const debugResponse = async (url, response) => {

  console.log(`request returning ${response.status} from ${url}`, response)
  console.error(`response bodyUsed?: ${response.bodyUsed}`)
  const body = await response.text()
  console.error(`>response>${body}<response<`)

  return body
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

  const requestId = generateUUID()
  console.log(`handling proxy request...`)
  console.time(requestId)

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

    return new Response (
      body,
      {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      }
    )
  } finally {
    console.timeEnd(requestId)
  }
}