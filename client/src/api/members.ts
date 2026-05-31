import { apiClient } from './client';

export type ProjectMember = {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
};

export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await apiClient.get<{ members: ProjectMember[] }>(`/projects/${projectId}/members`);
  return res.data.members;
}
