import type { Handle } from '@sveltejs/kit';

// this is here so we can use the dashboard proxy for local development - e.g. port-forwarding the dashboard and accessing
// from localhost served up via e.g. http://localhost:8087/ when running 'make dev'
export const handle: Handle = async ({ resolve, event }) => {

  // Apply CORS header for API routes
  if (event.url.pathname.startsWith('/api')) {
    // Required for CORS to work
    if(event.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        }
      })
    }
  }

  const response = await resolve(event)

  if (event.url.pathname.startsWith('/api')) {
    // the original response headers may be immutable
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    console.log(`appending CORS headers for ${event.url.pathname}, Access-Control-Allow-Origin is ${newResponse.headers.get('Access-Control-Allow-Origin')}`)
    return newResponse
  } else {
    return response
  }
}