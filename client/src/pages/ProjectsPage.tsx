import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import ProjectCard from '../components/projects/ProjectCard';

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-0.5 text-sm text-gray-500">All projects you are a member of</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load projects. Please try again.
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-lg font-medium text-gray-400">No projects yet</p>
          <p className="mt-1 text-sm text-gray-400">Create your first project to get started</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
