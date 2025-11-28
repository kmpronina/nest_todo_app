import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class DiffTaskDataInterceptor implements NestInterceptor {
    constructor(private readonly tasksService: TasksService) {}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();

        const { method, body } = req;

        // const task = await this.tasksService.findOne(req.body.values.id);

        return next.handle().pipe(
            tap(() => {
                if (method === 'POST' || method === 'PATCH') {
                    // const diffs = {};
                    // for (const key in body.values) {
                    //     if (body.values[key] !== task[key]) {
                    //         diffs[key] = { old: task[key], new: body.values[key] };
                    //     }
                    // }
                    // console.log(`Task ${task.id} data changes:`, diffs);
                    console.log(`Task data has been changed: `, body.values);
                }
            })
        );
    }
}
