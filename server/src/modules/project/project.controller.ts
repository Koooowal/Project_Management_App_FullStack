import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';
import { CreateProjectInput, UpdateProjectInput } from './project.schemas';

const projectInclude = {
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, members: true } },
} as const;

export async function getProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.userId } } },
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function createProject(
  req: AuthRequest & { body: CreateProjectInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: { create: { userId } },
      },
      include: projectInclude,
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(
  req: Request<{ id: string }> & AuthRequest & { body: UpdateProjectInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params['id'] as string;
    const userId = req.user.userId;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
    if (project.ownerId !== userId) { res.status(403).json({ message: 'Only the project owner can update it' }); return; }

    const updated = await prisma.project.update({
      where: { id },
      data: req.body,
      include: projectInclude,
    });

    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(
  req: Request<{ id: string }> & AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params['id'] as string;
    const userId = req.user.userId;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
    if (project.ownerId !== userId) { res.status(403).json({ message: 'Only the project owner can delete it' }); return; }

    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.projectMember.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
