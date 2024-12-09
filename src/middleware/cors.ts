import { defineMiddleware } from "astro:middleware";

export const corsMiddleware = defineMiddleware(async ({ request }, next) => {
    console.info('corsMiddleware');
    const origin = request.headers.get('Origin');

    console.info({origin});
    return await next();

    // if (request.method === 'OPTIONS') {
    //     let headers = new Headers();
    //     headers.append('Access-Control-Allow-Origin', '*');
    //     headers.append('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    //     headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //     return new Response(null, { headers });
    // }

    // const response = await next();

    // const headers = new Headers(response.headers);
    // headers.append('Access-Control-Allow-Origin', '*');
    // headers.append('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    // headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // return new Response(response.body, { 
    //     ...response, 
    //     headers: headers, 
    // }); 
});