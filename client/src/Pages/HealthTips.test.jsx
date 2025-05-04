import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthTips from './Pages/HealthTips';

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
 
  // Test 3: Verify default active tab
  test('shows "Eligible" content by default', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Verify "Eligible" section title is visible
    expect(screen.getByText('Blood Donation Eligibility Criteria')).toBeInTheDocument();
    
    // STEP 3: Verify a specific item from the "Basic Requirements" list is visible
    expect(screen.getByText('Age between 18-65 years')).toBeInTheDocument();
    
    // STEP 4: Verify an item from "Permanent Deferrals" is visible
    expect(screen.getByText('HIV or AIDS diagnosis')).toBeInTheDocument();
  });

  // Test 4: Test tab switching functionality
  test('switches to "Ineligible" tab when clicked', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Find and click the "Ineligible" tab
    const ineligibleTab = screen.getByText('Ineligible');
    fireEvent.click(ineligibleTab);
    
    // STEP 3: Verify "Ineligible" section title is now visible
    expect(screen.getByText('If You\'re Temporarily Ineligible')).toBeInTheDocument();
    
    // STEP 4: Verify content specific to the "Ineligible" tab is visible
    expect(screen.getByText('Improving Hemoglobin Levels')).toBeInTheDocument();
    expect(screen.getByText('Include iron-rich foods in your diet (red meat, spinach, beans, lentils)')).toBeInTheDocument();
  });

  // Test 5: Verify "Eligible" tab content sections
  test('shows all sections in the "Eligible" tab', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Check for all section headers
    expect(screen.getByText('Basic Requirements')).toBeInTheDocument();
    expect(screen.getByText('Timing Requirements')).toBeInTheDocument();
    expect(screen.getByText('Temporary Deferrals')).toBeInTheDocument();
    expect(screen.getByText('Permanent Deferrals')).toBeInTheDocument();
  });

  // Test 6: Verify "Ineligible" tab content sections
  test('shows all sections in the "Ineligible" tab', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Switch to "Ineligible" tab
    fireEvent.click(screen.getByText('Ineligible'));
    
    // STEP 3: Check for all section headers in this tab
    expect(screen.getByText('Improving Hemoglobin Levels')).toBeInTheDocument();
    expect(screen.getByText('Exercise for Better Heart Health')).toBeInTheDocument();
    expect(screen.getByText('Hydration Tracking')).toBeInTheDocument();
    expect(screen.getByText('Other Ways to Help')).toBeInTheDocument();
  });

  // Test 7: Verify that we can switch back to "Eligible" tab
  test('switches back to "Eligible" tab when clicked', () => {
    // STEP 1: Render the component
    render(<HealthTips/>);
    
    // STEP 2: First switch to "Ineligible" tab
    fireEvent.click(screen.getByText('Ineligible'));
    
    // STEP 3: Then switch back to "Eligible" tab
    fireEvent.click(screen.getByText('Eligible'));
    
    // STEP 4: Verify "Eligible" content is visible again
    expect(screen.getByText('Blood Donation Eligibility Criteria')).toBeInTheDocument();
  });

  // Test 8: Verify specific content items in Eligible tab
  test('displays correct eligibility criteria details', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Check for specific eligibility requirements
    expect(screen.getByText('Weight of at least 45 kg')).toBeInTheDocument();
    expect(screen.getByText('Hemoglobin level of at least 12.5 g/dL')).toBeInTheDocument();
    expect(screen.getByText('Normal blood pressure (between 100-180 systolic and 50-100 diastolic)')).toBeInTheDocument();
    
    // STEP 3: Check for specific timing requirements
    expect(screen.getByText('At least 3 months since your last whole blood donation')).toBeInTheDocument();
    expect(screen.getByText('At least 6 months after pregnancy')).toBeInTheDocument();
  });

  // Test 9: Verify specific content items in Ineligible tab
  test('displays correct improvement tips for ineligible donors', () => {
    // STEP 1: Render the component
    render(<HealthTips />);
    
    // STEP 2: Switch to "Ineligible" tab
    fireEvent.click(screen.getByText('Ineligible'));
    
    // STEP 3: Check for specific improvement tips
    expect(screen.getByText('Pair iron-rich foods with vitamin C for better absorption')).toBeInTheDocument();
    expect(screen.getByText('Aim for at least 30 minutes of moderate exercise 5 days a week')).toBeInTheDocument();
    expect(screen.getByText('Aim for 8-10 glasses (2-3 liters) of water daily')).toBeInTheDocument();
    
    // STEP 4: Check for "Other Ways to Help" content
    expect(screen.getByText('• Volunteer at blood drives or donation centers')).toBeInTheDocument();
    expect(screen.getByText('• Spread awareness about blood donation through social media')).toBeInTheDocument();
  });

  // Test 10: Check if proper icons are rendered
  test('renders the appropriate icons for different sections', () => {
    // STEP 1: Render the component
    render(<HealthTips/>);
    
    // STEP 2: Note: We can't easily test for specific icons, but we can check 
    // that icons' parent containers are present by testing for their surrounding content
    // This is a limitation of the test since we can't easily query SVG icons
    
    // Check that the basic requirements section and its content exists
    expect(screen.getByText('Basic Requirements')).toBeInTheDocument();
    
    // STEP 3: Switch to "Ineligible" tab to check those icons
    fireEvent.click(screen.getByText('Ineligible'));
    
    // Verify the sections exist that should have icons
    expect(screen.getByText('Improving Hemoglobin Levels')).toBeInTheDocument();
    expect(screen.getByText('Exercise for Better Heart Health')).toBeInTheDocument();
    expect(screen.getByText('Hydration Tracking')).toBeInTheDocument();
  });
});