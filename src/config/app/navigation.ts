import type { NavigationItem } from '@/types/navigation';

export const appNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Command Center',
    description: 'Operational overview and health status.',
  },
  {
    href: '/map',
    label: 'GIS Risk Map',
    description: 'Future GIS layers and spatial analysis surfaces.',
  },
  {
    href: '/habitations',
    label: 'Vulnerable Habitations',
    description: 'Future habitation assessment workflows.',
  },
  {
    href: '/relocation',
    label: 'Relocation Planning',
    description: 'Future prioritization and site-matching workflows.',
  },
  {
    href: '/reports',
    label: 'Reports',
    description: 'Future authority-ready report generation.',
  },
  {
    href: '/admin',
    label: 'Administration',
    description: 'Platform governance, configuration, and diagnostics.',
    requiredRoles: ['platform_admin'],
  },
];

