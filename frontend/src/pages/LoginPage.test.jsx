import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual('../lib/api');
  return { ...actual, default: { get: vi.fn(), post: vi.fn() } };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

afterEach(() => {
  localStorage.clear();
});

describe('LoginPage', () => {
  it('renders the sign-in form and brand', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /sign in to your workspace/i })).toBeTruthy();
    expect(screen.getByLabelText(/username/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('lists all four demo accounts', () => {
    renderLogin();
    for (const name of ['admin', 'engineer', 'operator', 'inspector']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it('has accessible form controls', () => {
    renderLogin();
    const user = screen.getByLabelText(/username/i);
    expect(user.getAttribute('autocomplete')).toBe('username');
    expect(screen.getByLabelText(/password/i).getAttribute('type')).toBe('password');
  });
});
