import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectListSkeleton from '../components/projects/ProjectListSkeleton';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { ProjectsEmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <Button onClick={() => setModalOpen(true)}>+ New project</Button>
      </div>

      {isLoading && <ProjectListSkeleton />}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load projects. Please try again.
        </div>
      )}

      {!isLoading && projects && projects.length === 0 && (
        <ProjectsEmptyState onCreateClick={() => setModalOpen(true)} />
      )}

      {!isLoading && projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
