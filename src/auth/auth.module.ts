import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';

export const AUTH_OPTIONS = 'AUTH_OPTIONS';

export interface AuthModuleOptions {
  secret: string;
  tokenPrefix?: string;
}

@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        AuthService,
        {
          provide: AUTH_OPTIONS,
          useValue: options,
        },
      ],
      exports: [AuthService],
    };
  }
}
