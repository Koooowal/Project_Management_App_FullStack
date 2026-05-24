import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject, Project } from '../../api/projects';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Props = {
  project: Project;
  open: boolean;
  onClose: () => void;
};

export default function EditProjectModal({ project, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description ?? '');
      setError('');
    }
  }, [open, project]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      updateProject(project.id, { name: data.name, description: data.description || null }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(['projects'], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
      onClose();
    },
    onError: () => setError('Failed to update project. Please try again.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    mutation.mutate({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit project">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Project name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
