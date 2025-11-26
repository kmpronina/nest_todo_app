import { IsBoolean, IsOptional, IsString, MinLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority } from 'src/common/task-priority.enum';
import { TaskStatus } from 'src/common/task-status.enum';

export class CreateTaskDto {
    @IsString()
    @MinLength(3)
    // @Transform(({ value }) => {})
    title: string;

    @IsString()
    @MinLength(3)
    userId: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean = false;

    @IsString()
    status?: TaskStatus;

    @IsOptional()
    @IsString()
    priority?: TaskPriority;

    @Type(() => Date)
    @IsDate()
    deadline: Date;
}
