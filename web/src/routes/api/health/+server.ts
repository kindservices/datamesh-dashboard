import { type RequestHandler } from '@sveltejs/kit'
import { json, text } from '@sveltejs/kit'


export const fallback: RequestHandler = async ({ request }) => {
    console.log(`handling health request...`)
    const jsonBody = await request.text()
	return text(`${request.method} request sent body '${jsonBody}' at ${new Date()}`)
};