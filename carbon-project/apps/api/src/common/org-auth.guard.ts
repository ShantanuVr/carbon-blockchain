import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORG_AUTH_KEY } from './org-auth.decorator';

@Injectable()
export class OrgAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const orgIdParam = this.reflector.getAllAndOverride<string>(ORG_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!orgIdParam) {
      // No org auth required
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.orgId) {
      throw new ForbiddenException('User organization not found');
    }

    // Extract orgId from request (body, params, or query)
    const requestOrgId = request.body?.[orgIdParam] || 
                        request.params?.[orgIdParam] || 
                        request.query?.[orgIdParam];

    if (!requestOrgId) {
      // If orgId not provided in request, allow (might be optional)
      return true;
    }

    // Admin users can act on behalf of any org
    if (user.role === 'ADMIN') {
      return true;
    }

    // Verify user's org matches request orgId
    if (user.orgId !== requestOrgId) {
      throw new ForbiddenException('Cannot perform action on behalf of another organization');
    }

    return true;
  }
}

