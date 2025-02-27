export function validateFastAPICode(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required imports
  if (!code.includes('from fastapi import FastAPI')) {
    errors.push('Missing FastAPI import');
  }
  if (!code.includes('from pydantic import BaseModel')) {
    errors.push('Missing Pydantic import');
  }

  // Check for basic structure
  if (!code.includes('app = FastAPI')) {
    errors.push('Missing FastAPI app initialization');
  }

  // Check for CRUD endpoints
  const requiredEndpoints = ['@app.get', '@app.post', '@app.put', '@app.delete'];
  requiredEndpoints.forEach(endpoint => {
    if (!code.includes(endpoint)) {
      errors.push(`Missing ${endpoint} endpoint`);
    }
  });

  // Check for Pydantic models
  if (!code.includes('class') || !code.includes('BaseModel')) {
    errors.push('Missing Pydantic model definition');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 