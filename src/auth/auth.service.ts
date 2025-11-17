import { Inject, Injectable } from '@nestjs/common';
import { AUTH_OPTIONS, type AuthModuleOptions } from './auth.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
  ) {}

  issueToken(userId: string): string {
    const prefix = this.options.tokenPrefix ?? 'Bearer';
    const payload = Buffer.from(`${userId}:${this.options.secret}`).toString(
      'base64',
    );

    return `${prefix} ${payload}`;
  }

  verifyToken(token: string): string {
    const [prefix, encoded] = token.split(' ');

    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    //userid:secret
    const [userId, secret] = decoded.split(':');

    if (secret !== this.options.secret) {
      throw new Error('Invalid token');
    }

    return userId;
  }
}
