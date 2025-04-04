// tours-service/src/common/guards/verified-user.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // User data comes from the AuthGuard
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if the user's email is verified
    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Only verified users can create and manage tours',
      );
    }

    return true;
  }
}
