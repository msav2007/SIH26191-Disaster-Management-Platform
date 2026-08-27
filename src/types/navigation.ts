import type { AppRole } from '@/types/app';

export type NavigationItem = {
  href:
    | '/dashboard'
    | '/map'
    | '/habitations'
    | '/relocation'
    | '/reports'
    | '/scenarios'
    | '/admin';
  label: string;
  description: string;
  requiredRoles?: AppRole[];
};

