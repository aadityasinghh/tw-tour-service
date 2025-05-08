// tours-service/src/common/guards/auth.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map } from 'rxjs';
import { ResponseService } from '../services/response.service';
import { ResponseMessages } from '../constants/response-messages.constant';

interface AuthResponse {
    status: number;
    data: {
        userId: string;
        email: string;
        // isEmailVerified: boolean;
        name: string;
    };
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        private responseService: ResponseService,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        // const authServiceUrl = this.configService.get('AUTH_SERVICE_URL');

        // Get the JWT from the cookies
        const token = request.cookies?.access_token;

        if (!token) {
            return this.responseService.unauthorized(
                'Authentication token is missing',
            );
        }

        // Call the auth service's validation endpoint
        return this.httpService
            .get<AuthResponse>(`http://localhost:3001/auth/validate`, {
                headers: {
                    Cookie: `access_token=${token}`,
                },
            })
            .pipe(
                map((response) => {
                    if (response.status === HttpStatus.OK) {
                        // Add user data to request for later use
                        request.user = response.data.data;
                        return true;
                    }
                    return false;
                }),
                catchError(() => {
                    return this.responseService.unauthorized(
                        ResponseMessages.UNAUTHORIZED,
                    );
                }),
            );
    }
}
