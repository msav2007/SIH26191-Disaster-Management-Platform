import { render, screen } from '@testing-library/react';

import DashboardPage from '@/app/(app)/dashboard/page';

describe('DashboardPage', () => {
  it('renders the command center dashboard overview', async () => {
    const Component = await DashboardPage();
    render(Component);

    expect(
      screen.getByRole('heading', {
        name: /Multi-Hazard Disaster Relocation Command Center/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open GIS Workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Statutory Reports/i })).toBeInTheDocument();
  });
});
