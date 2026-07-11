import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import AssigneeSelect from './AssigneeSelect';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export default function CreateTaskModal({ projectId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { title: string; description?: string; assigneeId?: string }) =>
      createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast('Task created successfully');
      handleClose();
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const message = data?.message ?? 'Failed to create task. Please try again.';
      setError(message);
      showToast(message, 'error');
    },
  });

  function handleClose() {
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setError('');
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId: assigneeId || undefined,
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title="New task">
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
          placeholder="What needs to be done?"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <AssigneeSelect projectId={projectId} value={assigneeId} onChange={setAssigneeId} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
