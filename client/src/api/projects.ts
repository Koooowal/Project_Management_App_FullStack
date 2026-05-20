import { apiClient } from './client';

export type Project = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  _count: { tasks: number; members: number };
};

export type CreateProjectInput = { name: string; description?: string };
export type UpdateProjectInput = { name?: string; description?: string | null };

export async function fetchProjects(): Promise<Project[]> {
  const res = await apiClient.get<{ projects: Project[] }>('/projects');
  return res.data.projects;
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const res = await apiClient.post<{ project: Project }>('/projects', data);
  return res.data.project;
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  const res = await apiClient.put<{ project: Project }>(`/projects/${id}`, data);
  return res.data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}
