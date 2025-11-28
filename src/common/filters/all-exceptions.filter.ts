import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionsResponse = isHttpException ? exception.getResponse() : null;

        this.logger.error(`Error on ${request.method} ${request.url}`, (exception as any)?.stack || String(exception));

        const errorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            message: this.normalizeMessage(exceptionsResponse),
            errorCode: this.extractErrorCode(exceptionsResponse)
        };
    }

    private extractErrorCode(exceptionsResponse: unknown) {
        if (typeof exceptionsResponse === 'object' && 'errorCode' in exceptionsResponse) {
            return String((exceptionsResponse as any).error);
        }
        return null;
    }

    private normalizeMessage(exceptionsResponse: unknown) {
        if (typeof exceptionsResponse === 'string') {
            return [exceptionsResponse];
        }

        if (typeof exceptionsResponse === 'object' && 'message' in exceptionsResponse) {
            const message = (exceptionsResponse as any).message;
            if (Array.isArray(message)) {
                return message;
            } else if (typeof message === 'string') {
                return [message];
            }
        }

        return ['Internal server error'];
    }
}
