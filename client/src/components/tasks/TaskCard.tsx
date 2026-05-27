import { Task, TaskStatus } from '../../api/tasks';

type Props = { task: Task };

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'To do', className: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-amber-100 text-amber-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
};

export default function TaskCard({ task }: Props) {
  const { label, className } = statusConfig[task.status];

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
          {label}
        </span>
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
