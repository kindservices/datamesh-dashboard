import { json, type RequestHandler } from '@sveltejs/kit'
import {dashboardBFFHost} from '../../settings'

export const GET: RequestHandler = async (event) => {
  const segments = event.url.pathname.split('/');
  const id = segments[segments.length -1 ];


  const url = new URL(`component/${id}`, dashboardBFFHost);
  console.log(`proxy getting ${url}, as dashboardBFFHost is ${dashboardBFFHost}`);
  const r = await fetch(url);
  console.log(`... returned ${r.status}: ${JSON.stringify(r.text)}`);
  return r;
}

