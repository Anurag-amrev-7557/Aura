export const runtime = "nodejs";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || typeof file === "string") {
      return new Response("Missing file", { status: 400 });
    }

    const apiKey = process.env.RESUME_PARSER_API_KEY;
    if (!apiKey) {
      return new Response("Resume parser API key not configured", { status: 500 });
    }

    // Convert file to buffer for API upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call the resume parser API
    const response = await fetch('https://api.apilayer.com/resume_parser/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'apikey': apiKey
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resume parser API error:', errorText);
      return new Response(`Resume parser API error: ${response.status} - ${errorText}`, { 
        status: response.status 
      });
    }

    const parsedData = await response.json();
    
    // Return the structured resume data
    return Response.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return new Response(`Resume parsing error: ${error.message}`, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    
    if (!url) {
      return new Response("Missing URL parameter", { status: 400 });
    }

    const apiKey = process.env.RESUME_PARSER_API_KEY;
    if (!apiKey) {
      return new Response("Resume parser API key not configured", { status: 500 });
    }

    // Call the resume parser API with URL
    const response = await fetch(`https://api.apilayer.com/resume_parser/url?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resume parser API error:', errorText);
      return new Response(`Resume parser API error: ${response.status} - ${errorText}`, { 
        status: response.status 
      });
    }

    const parsedData = await response.json();
    
    // Return the structured resume data
    return Response.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return new Response(`Resume parsing error: ${error.message}`, { status: 500 });
  }
}
