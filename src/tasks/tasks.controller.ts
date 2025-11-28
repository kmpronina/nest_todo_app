import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    HttpCode,
    UseInterceptors,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    UseGuards,
    UsePipes
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { TaskOwnerOrAdminGuard } from 'src/common/guards/task-owner-or-admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { NormalizeTaskPipe } from 'src/common/pipes/normalize-task.pipe';
import { TaskStatusValidationPipe } from 'src/common/pipes/task-status-validation.pipe';
import { TaskStatus } from 'src/common/task-status.enum';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { TaskDeadlinePipe } from 'src/common/pipes/task-deadline.pipe';
import { DiffTaskDataInterceptor } from 'src/common/interceptors/diff-task-data.interceptor';

@Controller('tasks')
@UseInterceptors(LoggerInterceptor, ResponseTransformInterceptor)
export class TasksController {
    constructor(private readonly tasks: TasksService) {}

    @Get()
    @UseInterceptors(CacheInterceptor)
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status', TaskStatusValidationPipe) status: TaskStatus
    ) {
        const all = await this.tasks.findAll();
        const start = (page - 1) * limit;
        const data = all.slice(start, start + limit);

        return {
            data,
            meta: {
                page,
                limit,
                total: all.length
            }
        };
    }

    @Get(':id')
    @UseInterceptors(CacheInterceptor)
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const task = await this.tasks.findOne(id);

        return task;
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(201)
    @UsePipes(NormalizeTaskPipe, TaskDeadlinePipe)
    @UseInterceptors(DiffTaskDataInterceptor)
    create(@Body() dto: CreateTaskDto) {
        return this.tasks.create(dto);
    }

    @Delete(':id')
    @UseGuards(ApiKeyGuard)
    @HttpCode(204)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.tasks.remove(id);
    }

    @Patch(':id/complete')
    @UseInterceptors(DiffTaskDataInterceptor)
    complete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.tasks.complete(id);
    }

    @Patch('complete')
    @UseInterceptors(DiffTaskDataInterceptor)
    completeMany(@Body() dto: CompleteManyDto) {
        return this.tasks.completeMany(dto.ids);
    }

    @Patch(':id')
    @UseGuards(TaskOwnerOrAdminGuard)
    @UseInterceptors(DiffTaskDataInterceptor)
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTaskDto) {
        return this.tasks.update(id, dto);
    }

    @Get('whoami')
    async getUser(@CurrentUser() user) {
        return user ?? { message: ' no user found' };
    }
}
