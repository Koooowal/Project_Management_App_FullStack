import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, updateTask } from '../../api/tasks';

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
  const { label, className } = statusConfig[task.status];

  const mutation = useMutation({
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

  function cycleStatus() {
    mutation.mutate(nextStatus[task.status]);
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        <button
          type="button"
          onClick={cycleStatus}
          disabled={mutation.isPending}
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
        <p className="mt-3 text-xs text-gray-400">Assigned to {task.assignee.name}</p>
      )}
    </div>
  );
}
