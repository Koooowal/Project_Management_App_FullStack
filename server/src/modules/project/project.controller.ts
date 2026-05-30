import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';
import { toSafeUser } from '../user/user.types';
import { AddMemberInput, CreateProjectInput, UpdateProjectInput } from './project.schemas';

const projectInclude = {
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, members: true } },
} as const;

async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return !!membership;
}

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

export async function getProjectMembers(
  req: Request<{ id: string }> & AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = req.params['id'] as string;
    const userId = req.user.userId;

    if (!(await isProjectMember(projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this project' });
      return;
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      members: members.map((m) => ({
        id: m.id,
        joinedAt: m.createdAt,
        user: toSafeUser(m.user),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function addProjectMember(
  req: Request<{ id: string }> & AuthRequest & { body: AddMemberInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = req.params['id'] as string;
    const userId = req.user.userId;
    const { email } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    if (project.ownerId !== userId) {
      res.status(403).json({ message: 'Only the project owner can invite members' });
      return;
    }

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
      res.status(404).json({ message: 'User with this email was not found' });
      return;
    }

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: invitee.id, projectId } },
    });
    if (existing) {
      res.status(409).json({ message: 'User is already a project member' });
      return;
    }

    const member = await prisma.projectMember.create({
      data: { userId: invitee.id, projectId },
      include: { user: true },
    });

    res.status(201).json({
      member: {
        id: member.id,
        joinedAt: member.createdAt,
        user: toSafeUser(member.user),
      },
    });
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
