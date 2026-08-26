import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the landing page with the command center entry point', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: /Production-grade foundation for an authority-facing disaster relocation decision platform/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Command Center/i })).toBeInTheDocument();
  });
});
