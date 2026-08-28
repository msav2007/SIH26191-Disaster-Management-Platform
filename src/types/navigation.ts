import type { AppRole } from '@/types/app';

export type NavigationItem = {
  href:
    | '/dashboard'
    | '/habitations'
    | '/habitations?filter=critical'
    | '/scenarios'
    | '/relocation'
    | '/reports'
    | '/map'
    | '/admin';
  label: string;
  badge?: string;
  requiredRoles?: AppRole[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};
