export enum StepType {
  TYPES = 'types',        // Define types/models/interfaces
  SETUP = 'setup',        // Initial setup (imports, router setup)
  GET_ALL = 'get-all',    // GET / endpoint
  GET_ONE = 'get-by-id',  // GET /:id endpoint
  CREATE = 'create',      // POST / endpoint
  UPDATE = 'update',      // PUT /:id endpoint
  DELETE = 'delete'       // DELETE /:id endpoint
} 