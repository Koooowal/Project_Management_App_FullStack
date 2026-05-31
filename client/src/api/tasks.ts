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

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
};

export async function fetchProjectTasks(projectId: string): Promise<Task[]> {
  const res = await apiClient.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`);
  return res.data.tasks;
}

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assigneeId?: string | null;
};

export async function createTask(projectId: string, data: CreateTaskInput): Promise<Task> {
  const res = await apiClient.post<{ task: Task }>(`/projects/${projectId}/tasks`, data);
  return res.data.task;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const res = await apiClient.put<{ task: Task }>(`/tasks/${id}`, data);
  return res.data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function assignTask(taskId: string, assigneeId: string | null): Promise<Task> {
  const res = await apiClient.put<{ task: Task }>(`/tasks/${taskId}/assign`, { assigneeId });
  return res.data.task;
}
