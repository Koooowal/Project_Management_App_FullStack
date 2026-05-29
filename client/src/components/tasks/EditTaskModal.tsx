import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, updateTask } from '../../api/tasks';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Props = {
  task: Task;
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export default function EditTaskModal({ task, projectId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setError('');
    }
  }, [open, task]);

  const mutation = useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      updateTask(task.id, { title: data.title, description: data.description || null }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(['projects', projectId, 'tasks'], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t)),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
    onError: () => setError('Failed to update task. Please try again.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    mutation.mutate({ title: title.trim(), description: description.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit task">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
