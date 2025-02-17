import { Resource } from '../entities/Resource';

export interface IResourceRepository {
  create(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource>;
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  update(id: string, resource: Partial<Resource>): Promise<Resource>;
  delete(id: string): Promise<void>;
} 