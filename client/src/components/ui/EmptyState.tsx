import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  onClick?: () => void;
};

export default function EmptyState({ icon, title, description, action, onClick }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center ${
        onClick ? 'cursor-pointer transition hover:border-indigo-300 hover:bg-indigo-50/30' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
      <p className="text-lg font-medium text-gray-500">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
    </svg>
  );
}

export function ProjectsEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={<FolderIcon />}
      title="No projects yet"
      description="Create your first project to start organizing tasks with your team."
      onClick={onCreateClick}
    />
  );
}

export function TasksEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={<ClipboardIcon />}
      title="No tasks yet"
      description="Add a task to track work and keep your project moving forward."
      onClick={onCreateClick}
    />
  );
}

export function FilteredTasksEmptyState() {
  return (
    <EmptyState
      icon={<FilterIcon />}
      title="No tasks match this filter"
      description="Try selecting a different status or create a new task."
    />
  );
}
