import type { NavigationGroup, NavigationItem } from '@/types/navigation';

export const navigationGroups: NavigationGroup[] = [
  {
    title: 'OPERATIONAL SUITE',
    items: [
      {
        href: '/dashboard',
        label: 'Command Dashboard',
      },
      {
        href: '/habitations',
        label: 'Risk Assessment',
      },
      {
        href: '/relocation',
        label: 'Relocation Planning',
      },
      {
        href: '/scenarios',
        label: 'Scenario Simulator',
      },
      {
        href: '/map',
        label: 'GIS Risk Map',
      },
      {
        href: '/reports',
        label: 'Reports & Exports',
      },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      {
        href: '/admin',
        label: 'Administration Console',
        requiredRoles: ['platform_admin'],
      },
    ],
  },
];

export const appNavigation: NavigationItem[] = navigationGroups.flatMap((g) => g.items);
