import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { siteConfig } from '@/config/app/site';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.shortName,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

