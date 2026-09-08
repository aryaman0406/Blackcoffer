import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App.js';

describe('App component', () => {
  it('renders dashboard heading, filter sidebar, and analytics overview', () => {
    render(<App />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
});
