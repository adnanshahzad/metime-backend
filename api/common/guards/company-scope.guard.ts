import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { params, body } = request;

    // Super admin bypasses company scope
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Get company ID from various sources
    const requestedCompanyId = 
      params?.companyId || 
      params?.id || 
      body?.companyId || 
      body?.company;

    // If no company ID is requested, allow (for general operations)
    if (!requestedCompanyId) {
      return true;
    }

    // Check if user's company matches the requested company
    if (user.companyId && user.companyId.toString() !== requestedCompanyId.toString()) {
      throw new ForbiddenException('Access denied: Company scope violation');
    }

    return true;
  }
}
