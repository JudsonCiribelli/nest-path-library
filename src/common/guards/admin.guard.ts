import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Começando guard');

    const request = context
      .switchToHttp()
      .getRequest<Request & { users?: { token: string } }>();

    console.log(request.users);

    if (request.users?.token) return true;

    console.log('Finalizando guard');

    return false;
  }
}
