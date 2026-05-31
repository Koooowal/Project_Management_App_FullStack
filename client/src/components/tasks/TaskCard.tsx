import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, deleteTask, updateTask } from '../../api/tasks';
import EditTaskModal from './EditTaskModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import UserAvatar from '../ui/UserAvatar';

type Props = { task: Task; projectId: string };

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'To do', className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

export default function TaskCard({ task, projectId }: Props) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { label, className } = statusConfig[task.status];

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => updateTask(task.id, { status }),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['projects', projectId, 'tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['projects', projectId, 'tasks']);

      queryClient.setQueryData<Task[]>(['projects', projectId, 'tasks'], (old = []) =>
        old.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      );

      return { previous };
    },
    onError: (_err, _status, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects', projectId, 'tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.setQueryData<Task[]>(['projects', projectId, 'tasks'], (old = []) =>
        old.filter((t) => t.id !== task.id),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteOpen(false);
    },
  });

  function cycleStatus() {
    statusMutation.mutate(nextStatus[task.status]);
  }

  return (
    <>
      <div className="group relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 pr-20">
          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
          <button
            type="button"
            onClick={cycleStatus}
            disabled={statusMutation.isPending}
            title="Click to change status"
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition ${className} disabled:opacity-60`}
          >
            {label}
          </button>
        </div>

        {task.description && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{task.description}</p>
        )}

        {task.assignee && (
          <div className="mt-3 flex items-center gap-2">
            <UserAvatar name={task.assignee.name} />
            <span className="text-xs text-gray-500">{task.assignee.name}</span>
          </div>
        )}
      </div>

      <EditTaskModal
        task={task}
        projectId={projectId}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"?`}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
