import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ResponseService } from '../services/response.service';
import { ResponseMessages } from '../constants/response-messages.constant';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
    constructor(private readonly responseService: ResponseService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // User data comes from the AuthGuard
        // console.log(request);
        const user = request.user;

        if (!user) {
            return this.responseService.forbidden(
                ResponseMessages.UNAUTHORIZED,
            );
        }

        // Check if the user's email is verified
        if (!user.email_verified) {
            return this.responseService.forbidden(
                ResponseMessages.USER_NOT_AUTHORIZED,
            );
        }

        return true;
    }
}
