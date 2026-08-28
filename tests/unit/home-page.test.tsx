import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the landing page with the command center entry point', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: /Production Decision-Support System for Multi-Hazard Relocation/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Command Center/i })).toBeInTheDocument();
  });
});
