
// This file connects the frontend to the serverless API function
// The API handler is hosted by Vercel as a serverless function
export default async function handler(req: any, res: any) {
  // This is just a proxy to connect to the proper endpoint
  // In production, this file won't be used as requests go directly to the serverless function
  const url = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api/summarize' 
    : '/api/summarize';
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error forwarding to API:', error);
    return {
      error: 'Failed to connect to API endpoint'
    };
  }
}
