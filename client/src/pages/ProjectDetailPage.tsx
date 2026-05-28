import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import { fetchProjectTasks } from '../api/tasks';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import Button from '../components/ui/Button';

export default function ProjectDetailPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const project = projects?.find((p) => p.id === projectId);

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ['projects', projectId, 'tasks'],
    queryFn: () => fetchProjectTasks(projectId!),
    enabled: !!projectId,
  });

  if (!projectId) {
    return <p className="text-sm text-gray-500">Invalid project.</p>;
  }

  if (!projectsLoading && !project) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-gray-400">Project not found</p>
        <Link to="/projects" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to projects
      </Link>

      {projectsLoading ? (
        <div className="mb-6 h-16 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{project?.name}</h1>
          {project?.description && (
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
        <Button onClick={() => setModalOpen(true)}>+ New task</Button>
      </div>

      {tasksLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {tasksError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load tasks. Please try again.
        </div>
      )}

      {tasks && tasks.length === 0 && (
        <div
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 py-12 text-center transition hover:border-indigo-300"
          onClick={() => setModalOpen(true)}
        >
          <p className="text-gray-400">No tasks in this project yet</p>
          <p className="mt-1 text-sm text-gray-400">Click to create your first task</p>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      )}

      <CreateTaskModal
        projectId={projectId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
