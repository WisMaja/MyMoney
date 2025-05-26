import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login'; // adjust path
import { BrowserRouter } from 'react-router-dom';

// Mocks
jest.mock('../apiClient', () => ({
  post: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
  }),
}));

// Utility wrapper
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
  });

  it('shows error on short password during registration', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'abc' },
    });
    fireEvent.change(screen.getByLabelText(/repeat password/i), {
      target: { value: 'abc' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await screen.findByText(/password must be at least 8 characters long/i);
  });
});
