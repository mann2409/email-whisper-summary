
// This file connects the frontend to the serverless API function
export default async function handler(req: any, res: any) {
  // In production, API requests go directly to the serverless function
  // This is only used in development as a proxy
  const apiUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api/summarize' 
    : '/api/summarize';
  
  try {
    console.log("Proxying request to API:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
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
