import { apiClient } from './client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: { id: string; name: string; email: string } | null;
};

export async function fetchProjectTasks(projectId: string): Promise<Task[]> {
  const res = await apiClient.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`);
  return res.data.tasks;
}
