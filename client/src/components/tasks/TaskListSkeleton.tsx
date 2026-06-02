import Skeleton from '../ui/Skeleton';

type Props = { count?: number };

export default function TaskListSkeleton({ count = 3 }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-full rounded-lg" />
          <Skeleton className="mt-2 h-3 w-3/4 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
