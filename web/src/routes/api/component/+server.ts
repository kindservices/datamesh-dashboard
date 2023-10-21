import { json, type RequestHandler } from '@sveltejs/kit'
import {dashboardBFFHost} from '../settings'


export const GET: RequestHandler = async (event) => {

  console.log(`dashboardBFFHost is ${JSON.stringify(dashboardBFFHost)}`);
  const url = new URL("/component", String(dashboardBFFHost));
  console.log(`checking back-end for ${url}`);
  const response = await fetch(url);
  console.log(`listing services returning ${response.status}: ${response.body}`);
  return response;
  
}