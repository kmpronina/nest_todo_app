import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

@Injectable()
export class TaskStatusValidationPipe implements PipeTransform {
    readonly allowedStatuses = [TaskStatus.TO_DO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.DONE];

    transform(value: any) {
        if (!value) {
            return value;
        }

        if (!this.isStatusValue(value)) {
            throw new BadRequestException('Invalid task status value');
        }

        return value as TaskStatus;
    }

    private isStatusValue(status: any): boolean {
        return this.allowedStatuses.includes(status);
    }
}
