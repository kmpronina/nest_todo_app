import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    page: number,
    limit: number,
    completed?: boolean,
  ): Promise<{
    data: Task[];
    metadata: { page: number; limit: number; total: number };
  }> {
    const query = this.taskRepo
      .createQueryBuilder('task')
      .orderBy('task.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (completed !== undefined) {
      query.where({ completed });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      metadata: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

    return task;
  }

  async create(dto: CreateTaskDto, token: string): Promise<Task> {
    const ownerId = this.auth.verifyToken(token);

    const task = this.taskRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId,
    });

    const savedTask = await this.taskRepo.save(task);

    return savedTask;
  }

  async getOwnedTask(id: string, token?: string): Promise<Task> {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const ownerId = this.auth.verifyToken(token);
    const task = await this.findOne(id);

    if (task.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, token: string): Promise<Task> {
    await this.getOwnedTask(id, token);

    const task = await this.findOne(id);

    this.taskRepo.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    return this.taskRepo.save(task);
  }

  async complete(id: string, token: string): Promise<Task> {
    const task = await this.getOwnedTask(id, token);

    if (!task.completed) {
      task.completed = true;
      await this.taskRepo.save(task);
    }

    return task;
  }

  async completeMany(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: false,
      });

      if (tasks.length !== ids.length) {
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ completed: true })
        .where({ id: In(ids) })
        .execute();

      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async restore(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: true,
      });

      if (tasks.length !== ids.length) {
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .restore()
        .from(Task)
        .where({ id: In(ids) })
        .execute();

      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async remove(id: string, token: string): Promise<void> {
    const task = await this.getOwnedTask(id, token);
    this.taskRepo.softDelete(task.id);
  }

  toHateoas(task: Task) {
    return {
      ...task,
      _links: {
        self: { href: `/task/${task.id}` },
        update: { href: `/task/${task.id}`, method: 'PATCH' },
        delete: { href: `/task/${task.id}`, method: 'DELETE' },
        complete: { href: `/task/${task.id}/complete`, method: 'POST' },
      },
    };
  }
}
