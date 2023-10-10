import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
  const segments = event.url.pathname.split('/');
  const id = segments[segments.length -1 ];

  // TODO - config via env
  // const url = new URL(`component/${id}`, "http://localhost:8081");
  const url = new URL(`component/${id}`, "http://dashboard-bff-service.mfe:8080");
  console.log(`proxy getting ${url}`);
  const r = await fetch(url);
  console.log(`... returned ${r.status}: ${JSON.stringify(r.text)}`);
  return r;
}

