import { defineMiddleware } from "astro:middleware";

export const corsMiddleware = defineMiddleware(async ({ request }, next) => {
    console.info('corsMiddleware');
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
        let headers = new Headers();
        // TODO: Check origin against a whitelist.
        headers.append('Access-Control-Allow-Origin', origin ?? '*');
        headers.append('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
        headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        return new Response(null, { headers });
    }

    const response = await next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    return response; 
});