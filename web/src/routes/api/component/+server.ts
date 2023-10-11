import { json, type RequestHandler } from '@sveltejs/kit'

const dashboardHost = "http://dashboard-bff-service.data-mesh:8080";

export const GET: RequestHandler = async (event) => {

  const url = new URL("/component", dashboardHost);
  console.log(`checking back-end for ${url}`);
  const response = await fetch(url);
  console.log(`listing services returning ${response.status}: ${response.body}`);
  return response;
  
}