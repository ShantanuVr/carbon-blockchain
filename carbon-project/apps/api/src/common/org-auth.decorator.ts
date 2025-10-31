import { SetMetadata } from '@nestjs/common';

export const ORG_AUTH_KEY = 'orgAuth';
export const RequireOrgAuth = (orgIdParam: string = 'orgId') =>
  SetMetadata(ORG_AUTH_KEY, orgIdParam);

