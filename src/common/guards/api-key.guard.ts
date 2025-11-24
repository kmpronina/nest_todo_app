import { Injectable, CanActivate, UnauthorizedException, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly validApiKey = 'super-secret-key';

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const apiKey = req.headers['x-api-key'];

        if (apiKey !== this.validApiKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        return apiKey === this.validApiKey;
    }
}
