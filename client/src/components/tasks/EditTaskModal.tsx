import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, assignTask, updateTask } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import AssigneeSelect from './AssigneeSelect';
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
  const { showToast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setAssigneeId(task.assigneeId ?? '');
      setError('');
    }
  }, [open, task]);

  const mutation = useMutation({
    mutationFn: async (data: { title: string; description: string; assigneeId: string }) => {
      const updated = await updateTask(task.id, {
        title: data.title,
        description: data.description || null,
      });

      const assigneeChanged = (task.assigneeId ?? '') !== data.assigneeId;
      if (assigneeChanged) {
        return assignTask(task.id, data.assigneeId || null);
      }

      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(['projects', projectId, 'tasks'], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t)),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast('Task updated successfully');
      onClose();
    },
    onError: () => {
      setError('Failed to update task. Please try again.');
      showToast('Failed to update task', 'error');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
    });
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
        <AssigneeSelect projectId={projectId} value={assigneeId} onChange={setAssigneeId} />
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
