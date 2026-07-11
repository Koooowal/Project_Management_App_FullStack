import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject, Project } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EditProjectModal from './EditProjectModal';
import ConfirmDialog from '../ui/ConfirmDialog';

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOwner = user?.id === project.ownerId;

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.setQueryData<Project[]>(['projects'], (old = []) =>
        old.filter((p) => p.id !== project.id),
      );
      showToast('Project deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => showToast('Failed to delete project', 'error'),
  });

  return (
    <>
      <div className="group relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-300">
        <Link to={`/projects/${project.id}`} className="block">
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

        {isOwner && (
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <EditProjectModal
        project={project}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all tasks.`}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
