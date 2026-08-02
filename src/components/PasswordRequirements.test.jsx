import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordRequirements from './PasswordRequirements';

describe('PasswordRequirements', () => {
  it('renders one list item per requirement', () => {
    render(<PasswordRequirements password="" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('marks unmet requirements as not met for an empty password', () => {
    render(<PasswordRequirements password="" />);
    expect(screen.getByText('At least 12 characters').closest('li')).not.toHaveClass('met');
  });

  it('marks a requirement as met once satisfied', () => {
    render(<PasswordRequirements password="Correct-Horse-99" />);
    expect(screen.getByText('At least 12 characters').closest('li')).toHaveClass('met');
    expect(screen.getByText('One uppercase letter (A-Z)').closest('li')).toHaveClass('met');
    expect(screen.getByText('One number (0-9)').closest('li')).toHaveClass('met');
  });

  it('flags common passwords as not meeting the notCommon requirement', () => {
    render(<PasswordRequirements password="password1" />);
    expect(screen.getByText('Not a commonly used password').closest('li')).not.toHaveClass('met');
  });
});
