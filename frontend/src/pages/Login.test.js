import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// Mocks
const mockPost = jest.fn();
jest.mock('../apiClient', () => ({
  post: (...args) => mockPost(...args),
}));

const mockLogin = jest.fn();
const mockLogout = jest.fn();
let mockIsAuthenticated = false;
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Login Page', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockLogin.mockReset();
    mockLogout.mockReset();
    mockIsAuthenticated = false;
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders registration form and requirements', () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByText(/a password must:/i)).toBeInTheDocument();
    expect(screen.getByText(/8 characters long/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument();
  });

  it('toggles between login and register', () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/back to login/i));
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefg1!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'Abcdefg2!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error for short password', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abc1!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'Abc1!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
  });

  it('shows error for missing number', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefgh!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'Abcdefgh!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/password must contain at least one number/i)).toBeInTheDocument();
  });

  it('shows error for missing special character', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefg1' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'Abcdefg1' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/password must contain at least one special character/i)).toBeInTheDocument();
  });

  it('shows error for missing uppercase', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'abcdefg1!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'abcdefg1!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
  });

  it('shows error for missing lowercase', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'ABCDEFG1!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'ABCDEFG1!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
  });

  it('calls apiClient.post and shows alert on successful registration', async () => {
    window.alert = jest.fn();
    mockPost.mockResolvedValueOnce({});
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefg1!' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'Abcdefg1!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/register', { email: 'a@b.com', password: 'Abcdefg1!' });
    });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/account created/i));    
    });
  });

  it('calls login and navigates on successful login', async () => {
    mockPost.mockResolvedValueOnce({
      data: { accessToken: 'token', refreshToken: 'refresh' },
    });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefg1!' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'Abcdefg1!' });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('token', 'refresh');   
    });
  });

  it('shows error on invalid login', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { status: 401 } },
    });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'wrongpass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('disables submit button when loading', async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'Abcdefg1!' } });
    mockPost.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('calls logout if already authenticated', () => {
    mockIsAuthenticated = true;
    renderWithRouter(<Login />);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('clears error when toggling register', () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/need an account\? register/i));
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/repeat password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/back to login/i));
    expect(screen.queryByText(/password must be at least 8 characters long/i)).not.toBeInTheDocument();
  });
});