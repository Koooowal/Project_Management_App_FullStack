import Skeleton from '../ui/Skeleton';

type Props = { count?: number };

export default function ProjectListSkeleton({ count = 3 }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded-lg" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
