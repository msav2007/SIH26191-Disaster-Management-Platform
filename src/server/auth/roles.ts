import type { AppRole } from '@/types/app';

export const defaultRole: AppRole = 'analyst';

export const roleLabels: Record<AppRole, string> = {
  platform_admin: 'Platform Admin',
  state_authority: 'State Authority',
  district_planner: 'District Planner',
  analyst: 'Analyst',
  data_steward: 'Data Steward',
  auditor: 'Auditor',
};

export function hasRequiredRole(userRoles: AppRole[], requiredRoles?: AppRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}

