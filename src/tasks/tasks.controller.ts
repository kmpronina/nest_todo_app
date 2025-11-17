import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('completed') completed?: boolean,
  ) {
    return this.tasks.findAll(page, limit, completed);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.findOne(id);

    return this.tasks.toHateoas(task);
  }

  @Post()
  @HttpCode(201)
  create(
    @Body() dto: CreateTaskDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.tasks.create(dto, authHeader);
  }

  @Patch('restore')
  restore(@Body() ids: string[]) {
    return this.tasks.restore(ids);
  }

  @Patch('complete')
  completeMany(@Body() ids: string[]) {
    return this.tasks.completeMany(ids);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.tasks.update(id, dto, authHeader);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authHeader: string,
  ) {
    this.tasks.remove(id, authHeader);
  }

  @Patch(':id/complete')
  complete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.tasks.complete(id, authHeader);
  }
}
