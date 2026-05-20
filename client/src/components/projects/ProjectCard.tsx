import { Link } from 'react-router-dom';
import { Project } from '../../api/projects';

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-300"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{project.name}</h2>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
          {project._count.tasks} {project._count.tasks === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {project.description && (
        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
        <span>{project._count.members} {project._count.members === 1 ? 'member' : 'members'}</span>
        <span>·</span>
        <span>by {project.owner.name}</span>
      </div>
    </Link>
  );
}
