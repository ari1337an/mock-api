import { Project } from '../entities/Project';

export interface IProjectRepository {
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, project: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
} 