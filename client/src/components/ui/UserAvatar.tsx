type Props = {
  name: string;
  size?: 'sm' | 'md';
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserAvatar({ name, size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700 ${sizeClass}`}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
