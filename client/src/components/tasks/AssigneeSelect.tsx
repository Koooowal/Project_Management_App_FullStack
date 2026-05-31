import { useQuery } from '@tanstack/react-query';
import { fetchProjectMembers } from '../../api/members';

type Props = {
  projectId: string;
  value: string;
  onChange: (value: string) => void;
};

export default function AssigneeSelect({ projectId, value, onChange }: Props) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => fetchProjectMembers(projectId),
  });

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="assignee" className="text-sm font-medium text-gray-700">
        Assignee (optional)
      </label>
      <select
        id="assignee"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
      >
        <option value="">Unassigned</option>
        {members?.map((member) => (
          <option key={member.user.id} value={member.user.id}>
            {member.user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
