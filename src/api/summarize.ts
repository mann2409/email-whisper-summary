
// This file connects the frontend to the serverless API function
export default async function handler(req: any, res: any) {
  // Always use the deployed endpoint
  const apiUrl = '/api/summarize';
  
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
