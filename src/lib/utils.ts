import { NextResponse } from "next/server";

export function getErrorResponse(status: number, message: string) {
  return NextResponse.json(
    {
      error: {
        message,
        status,
      },
    },
    { status }
  );
}

export function formatCurl(method: string, url: string, headers?: Record<string, string>, body?: object): string {
  const parts: string[] = [`curl --location \\`];
  
  // Add method
  parts.push(`  --request ${method.toUpperCase()} \\`);
  
  // Add URL
  parts.push(`  '${url}' \\`);
  
  // Add headers
  if (headers) {
    Object.entries(headers).forEach(([key, value], index, array) => {
      const isLast = index === array.length - 1 && !body;
      parts.push(`  --header '${key}: ${value}'${isLast ? '' : ' \\'}`);
    });
  }
  
  // Add body if present
  if (body) {
    parts.push(`  --data-raw '${JSON.stringify(body, null, 2)}'`);
  }
  
  return parts.join('\n');
}

// Example usage:
// const curl = formatCurl(
//   'POST',
//   'http://localhost:3000/api/v1/resources',
//   { 'Content-Type': 'application/json' },
//   { name: 'test' }
// ); 

export function generateResourceCurls(projectId: string, version: string, resourceName: string) {
  const baseUrl = `http://localhost:3000/${projectId}/api/${version}/${resourceName}`;
  
  return {
    // Collection endpoints
    list: formatCurl(
      'GET',
      baseUrl,
      { 'Content-Type': 'application/json' }
    ),
    create: formatCurl(
      'POST',
      baseUrl,
      { 'Content-Type': 'application/json' },
      {
        "username": "lol"  // Simple example value
      }
    ),

    // Individual resource endpoints
    get: formatCurl(
      'GET',
      `${baseUrl}/{id}`,
      { 'Content-Type': 'application/json' }
    ),
    update: formatCurl(
      'PUT',
      `${baseUrl}/{id}`,
      { 'Content-Type': 'application/json' },
      {
        "name": "updated example",
        "description": "Updated description"
      }
    ),
    delete: formatCurl(
      'DELETE',
      `${baseUrl}/{id}`,
      { 'Content-Type': 'application/json' }
    )
  };
} 