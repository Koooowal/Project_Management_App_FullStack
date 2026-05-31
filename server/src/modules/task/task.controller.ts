import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AssignTaskInput, CreateTaskInput, UpdateTaskInput } from './task.schemas';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
} as const;

async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
  return !!membership;
}

export async function getProjectTasks(
  req: Request<{ projectId: string }> & AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = req.params['projectId'] as string;
    const userId = req.user.userId;

    if (!(await isProjectMember(projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this project' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTask(
  req: Request<{ projectId: string }> & AuthRequest & { body: CreateTaskInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = req.params['projectId'] as string;
    const userId = req.user.userId;
    const { title, description, status, assigneeId } = req.body;

    if (!(await isProjectMember(projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this project' });
      return;
    }

    if (assigneeId && !(await isProjectMember(projectId, assigneeId))) {
      res.status(400).json({ message: 'Assignee must be a project member' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId,
        assigneeId,
      },
      include: taskInclude,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: Request<{ id: string }> & AuthRequest & { body: UpdateTaskInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params['id'] as string;
    const userId = req.user.userId;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!(await isProjectMember(existing.projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this task' });
      return;
    }

    if (req.body.assigneeId && !(await isProjectMember(existing.projectId, req.body.assigneeId))) {
      res.status(400).json({ message: 'Assignee must be a project member' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: req.body,
      include: taskInclude,
    });

    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function assignTask(
  req: Request<{ id: string }> & AuthRequest & { body: AssignTaskInput },
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params['id'] as string;
    const userId = req.user.userId;
    const { assigneeId } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!(await isProjectMember(existing.projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this task' });
      return;
    }

    if (assigneeId && !(await isProjectMember(existing.projectId, assigneeId))) {
      res.status(400).json({ message: 'Assignee must be a project member' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: { assigneeId },
      include: taskInclude,
    });

    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: Request<{ id: string }> & AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params['id'] as string;
    const userId = req.user.userId;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!(await isProjectMember(existing.projectId, userId))) {
      res.status(403).json({ message: 'You do not have access to this task' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
