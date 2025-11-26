import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class DiffTaskDataInterceptor implements NestInterceptor {
    constructor(private readonly tasksService: TasksService) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();

        const { method, body } = req;

        return next.handle().pipe(
            tap(() => {
                if (method === 'POST' || method === 'PATCH') {
                    console.log(`Task data has been changed: `, body.values);
                }
            })
        );
    }
}
