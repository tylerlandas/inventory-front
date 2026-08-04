import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginScreen from './LoginScreen';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function getUsernameOnlySwitch() {
  return screen.getByRole('switch', { name: /log in with username only/i });
}

describe('LoginScreen', () => {
  const login = vi.fn();

  beforeEach(() => {
    login.mockReset();
    login.mockResolvedValue({ id: '1', username: 'testing321' });
    useAuth.mockReturnValue({ login });
    localStorage.clear();
  });

  it('shows the password field and defaults the username-only switch to off', () => {
    render(<LoginScreen onNavigate={() => {}} />);
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(getUsernameOnlySwitch()).not.toBeChecked();
  });

  it('hides the password field once the switch is turned on', () => {
    render(<LoginScreen onNavigate={() => {}} />);

    fireEvent.click(getUsernameOnlySwitch());

    expect(getUsernameOnlySwitch()).toBeChecked();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
  });

  it('logs in with just a username when the switch is on', async () => {
    render(<LoginScreen onNavigate={() => {}} />);

    fireEvent.click(getUsernameOnlySwitch());
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'someone' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('someone', undefined));
  });

  it('disables submit when the switch is on but the username is blank', () => {
    render(<LoginScreen onNavigate={() => {}} />);

    fireEvent.click(getUsernameOnlySwitch());
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: '' } });

    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });

  it('still requires a password when the switch is off', () => {
    render(<LoginScreen onNavigate={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '' } });

    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });

  it('remembers the switch setting across remounts', () => {
    const { unmount } = render(<LoginScreen onNavigate={() => {}} />);
    fireEvent.click(getUsernameOnlySwitch());
    unmount();

    render(<LoginScreen onNavigate={() => {}} />);

    expect(getUsernameOnlySwitch()).toBeChecked();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
  });
});
