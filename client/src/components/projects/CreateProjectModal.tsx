import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, Project } from '../../api/projects';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateProjectModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createProject,
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previous = queryClient.getQueryData<Project[]>(['projects']);

      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [
        {
          id: `temp-${Date.now()}`,
          name: newProject.name,
          description: newProject.description ?? null,
          ownerId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: { id: '', name: '', email: '' },
          _count: { tasks: 0, members: 1 },
        },
        ...old,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects'], context.previous);
      }
      setError('Failed to create project. Please try again.');
      showToast('Failed to create project', 'error');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast('Project created successfully');
      handleClose();
    },
  });

  function handleClose() {
    setName('');
    setDescription('');
    setError('');
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    mutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <Modal open={open} onClose={handleClose} title="New project">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Project name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="My awesome project"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
