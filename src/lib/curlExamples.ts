import { formatCurl } from "@/lib/utils";

export const EXAMPLE_GET_CURL = formatCurl(
  'GET',
  'http://localhost:3000/{projectId}/api/{version}/{resourceName}/{id}',
  { 'Content-Type': 'application/json' }
);

export const EXAMPLE_PUT_CURL = formatCurl(
  'PUT',
  'http://localhost:3000/{projectId}/api/{version}/{resourceName}/{id}',
  { 'Content-Type': 'application/json' },
  { 
    "name": "example",
    "description": "Updated description" 
  }
);

export const EXAMPLE_DELETE_CURL = formatCurl(
  'DELETE',
  'http://localhost:3000/{projectId}/api/{version}/{resourceName}/{id}',
  { 'Content-Type': 'application/json' }
);

export function getExampleCurls() {
  return {
    get: EXAMPLE_GET_CURL,
    put: EXAMPLE_PUT_CURL,
    delete: EXAMPLE_DELETE_CURL
  };
} 