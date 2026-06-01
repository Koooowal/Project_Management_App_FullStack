import { TaskStatus } from '../../api/tasks';

export type StatusFilter = 'ALL' | TaskStatus;

type Props = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
};

const tabs: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

export default function TaskStatusFilter({ value, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            value === tab.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          {tab.label}
          <span className="ml-1 opacity-75">({counts[tab.value]})</span>
        </button>
      ))}
    </div>
  );
}
