import { CanActivate, ForbiddenException, Injectable, ExecutionContext } from '@nestjs/common';
import { TasksService } from 'src/tasks/tasks.service';
import { RequestWithUser } from '../middlewares/user-context.middleware';

@Injectable()
export class TaskOwnerOrAdminGuard implements CanActivate {
    constructor(private readonly tasksService: TasksService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const user = req.user;
        const taskId = req.params.id;

        if (!user || !user.id) {
            throw new ForbiddenException('Unauthorized');
        }

        if (user.role === 'admin') {
            return true;
        }

        const task = await this.tasksService.findOne(taskId);

        if (!task) {
            throw new ForbiddenException('Task not found');
        }

        if (task.ownerId !== user.id) {
            throw new ForbiddenException('You are not the owner of this task');
        }

        return true;
    }
}
