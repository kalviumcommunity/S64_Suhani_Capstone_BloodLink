import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthTips from './HealthTips';

describe('HealthTips', () => {
  // Test 1: Renders header content correctly
  test('renders the header title and subtitle', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Check if the title is rendered
    expect(screen.getByText('Health Tips for Blood Donors')).toBeInTheDocument();
    
    // STEP 3: Check if the subtitle is rendered
    expect(screen.getByText('Learn how to prepare for donation and maintain your health')).toBeInTheDocument();
  });

  // Test 2: Verify tabs are rendered
  test('renders both "Eligible" and "Ineligible" tabs', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Check if both tabs exist
    expect(screen.getByText('Eligible')).toBeInTheDocument();
    expect(screen.getByText('Ineligible')).toBeInTheDocument();
  });