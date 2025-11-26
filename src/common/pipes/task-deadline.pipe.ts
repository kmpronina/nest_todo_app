import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TaskPriority } from '../task-priority.enum';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';

@Injectable()
export class TaskDeadlinePipe implements PipeTransform {
    readonly allowedPriorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];

    transform(dto: CreateTaskDto) {
        if (!dto.priority || dto.priority === TaskPriority.LOW) {
            return true;
        }

        const now = new Date();
        const deadline = new Date(dto.deadline);

        const timeDiff = deadline.getTime() - now.getTime();

        if (timeDiff <= 0) {
            throw new BadRequestException('Deadline must be a future date.');
        }

        if (dto.priority === TaskPriority.MEDIUM) {
            const maxDiff = 3 * 24 * 60 * 60 * 1000;
            if (timeDiff > maxDiff) {
                throw new BadRequestException('For MEDIUM priority tasks, the deadline must be within 3 days from now.');
            }
        } else if (dto.priority === TaskPriority.HIGH) {
            const maxDiff = 24 * 60 * 60 * 1000;
            if (timeDiff > maxDiff) {
                throw new BadRequestException('For HIGH priority tasks, the deadline must be within 1 day from now.');
            }
        }
        return dto;
    }
}
