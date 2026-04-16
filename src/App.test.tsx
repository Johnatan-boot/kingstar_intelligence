import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  ) as any;
});

describe('App Component', () => {
  it('renders the sidebar navigation', () => {
    render(<App />);
    
    // Verifica se os links principais do WMS estão sendo renderizados
    expect(screen.getAllByText(/Compras/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Recebimento/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Conferência/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PCL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Estoque/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Histórico/i).length).toBeGreaterThan(0);
  });
});
