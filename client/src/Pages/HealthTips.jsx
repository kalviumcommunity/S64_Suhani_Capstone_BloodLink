import React, { useState } from 'react';
import { Heart, Clock, AlertTriangle, X, DropletIcon, Thermometer, CircleHelp } from 'lucide-react';
import Nav from '../components/Nav';
export default function BloodDonorInfoPage() {
  const [activeTab, setActiveTab] = useState('eligible');
  
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    subtitle: {
      color: '#4b5563'
    },
    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      backgroundColor: '#f9fafb',
      borderRight: '1px solid #e5e7eb',
      color: '#6b7280'
    },
    activeTab: {
      backgroundColor: 'white',
      color: '#dc2626',
      borderBottom: '3px solid #dc2626',
      fontWeight: 'bold'
    },
    inactiveTab: {
      transition: 'background-color 0.2s ease'
    },
    content: {
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      color: '#1f2937',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px'
    },
    categoryContainer: {
      marginBottom: '32px'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    categoryDescription: {
      marginBottom: '16px',
      lineHeight: '1.5',
      color: '#4b5563'
    },
    iconContainer: {
      padding: '8px',
      borderRadius: '50%',
      backgroundColor: '#fee2e2',
      marginRight: '12px'
    },
    icon: {
      height: '20px',
      width: '20px',
      color: '#ef4444'
    },
    categoryTitle: {
      fontWeight: '500',
      color: '#1f2937'
    },
    list: {
      paddingLeft: '40px',
      color: '#374151'
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '12px',
      lineHeight: '1.5'
    },
    bullet: {
      marginRight: '8px'
    },
    helpSection: {
      marginTop: '24px',
      borderTop: '1px solid #e5e7eb',
      paddingTop: '24px'
    },
    helpHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    helpIconContainer: {
      padding: '8px',
      borderRadius: '50%',
      backgroundColor: '#e0e7ff',
      marginRight: '12px'
    },
    helpIcon: {
      height: '20px',
      width: '20px',
      color: '#4f46e5'
    },
    helpTitle: {
      fontWeight: '600',
      color: '#1f2937',
      fontSize: '16px'
    },
    helpLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '10px'
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderEligibleContent = () => (
    <div>
      <h2 style={styles.sectionTitle}>Blood Donation Eligibility Criteria</h2>
      
      {/* Basic Requirements */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <Heart style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Basic Requirements</h3>
        </div>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Age between 18-65 years</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Weight of at least 45 kg</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Hemoglobin level of at least 12.5 g/dL</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Normal blood pressure (between 100-180 systolic and 50-100 diastolic)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Normal pulse rate (between 50-100 beats per minute)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Normal body temperature</span>
          </li>
        </ul>
      </div>
      
      {/* Timing Requirements */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <Clock style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Timing Requirements</h3>
        </div>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>At least 3 months since your last whole blood donation</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>At least 2 weeks since recovering from a minor illness</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>At least 6 months after pregnancy</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>At least 24 hours after getting a dental cleaning</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>At least 72 hours after taking antibiotics</span>
          </li>
        </ul>
      </div>
      
      {/* Temporary Deferrals */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <AlertTriangle style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Temporary Deferrals</h3>
        </div>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Cold, flu, or fever in the last two weeks</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Certain vaccinations within specific timeframes</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Recent tattoos or piercings (wait 3-6 months)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Recent travel to areas with high risk of malaria</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Low hemoglobin levels</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Pregnancy or recent childbirth</span>
          </li>
        </ul>
      </div>
      
      {/* Permanent Deferrals */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <X style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Permanent Deferrals</h3>
        </div>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>HIV or AIDS diagnosis</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Hepatitis B or C</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Certain cancer diagnoses</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Heart or lung disease</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Uncontrolled diabetes</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>History of intravenous drug use</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderIneligibleContent = () => (
    <div>
      <h2 style={styles.sectionTitle}>If You're Temporarily Ineligible</h2>
      
      {/* Improving Hemoglobin Levels */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <DropletIcon style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Improving Hemoglobin Levels</h3>
        </div>
        <p style={styles.categoryDescription}>
          Low hemoglobin is one of the most common reasons for temporary deferral. Here's how to improve it:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Include iron-rich foods in your diet (red meat, spinach, beans, lentils)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Pair iron-rich foods with vitamin C for better absorption</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Consider iron supplements (consult with a healthcare provider)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Cook in cast iron pans which can add iron to your food</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Avoid tea and coffee with meals as they can inhibit iron absorption</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Allow at least 8 weeks after donation to improve hemoglobin levels</span>
          </li>
        </ul>
      </div>
      
      {/* Exercise for Better Heart Health */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <Heart style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Exercise for Better Heart Health</h3>
        </div>
        <p style={styles.categoryDescription}>
          Regular exercise improves cardiovascular health which can help maintain healthy blood pressure:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Aim for at least 30 minutes of moderate exercise 5 days a week</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Include a mix of cardio (walking, jogging) and strength training</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Start slowly and gradually increase intensity if you're new to exercise</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Consider yoga for stress reduction and improved circulation</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Consistently maintaining exercise is better than occasional intense workouts</span>
          </li>
        </ul>
      </div>
      
      {/* Hydration Tracking */}
      <div style={styles.categoryContainer}>
        <div style={styles.categoryHeader}>
          <div style={styles.iconContainer}>
            <Thermometer style={styles.icon} />
          </div>
          <h3 style={styles.categoryTitle}>Hydration Tracking</h3>
        </div>
        <p style={styles.categoryDescription}>
          Proper hydration is essential for maintaining blood volume and overall health:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Aim for 8-10 glasses (2-3 liters) of water daily</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Use a water bottle with time markers to track intake</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Drink additional water before and after exercise</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Include hydrating foods like cucumbers, watermelon, and oranges</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Monitor your urine color (paler indicates good hydration)</span>
          </li>
          <li style={styles.listItem}>
            <span style={styles.bullet}>•</span>
            <span>Increase intake during hot weather or when exercising</span>
          </li>
        </ul>
      </div>
      
      {/* Other Ways to Help */}
      <div style={styles.helpSection}>
        <div style={styles.helpHeader}>
          <div style={styles.helpIconContainer}>
            <CircleHelp style={styles.helpIcon} />
          </div>
          <h3 style={styles.helpTitle}>Other Ways to Help</h3>
        </div>
        <p style={styles.categoryDescription}>
          Even if you cannot donate blood, there are many other ways to support the cause:
        </p>
        <a href="#" style={styles.helpLink}>• Volunteer at blood drives or donation centers</a>
        <a href="#" style={styles.helpLink}>• Help organize blood donation events in your community</a>
        <a href="#" style={styles.helpLink}>• Spread awareness about blood donation through social media</a>
        <a href="#" style={styles.helpLink}>• Encourage eligible friends and family members to donate</a>
        <a href="#" style={styles.helpLink}>• Contribute to organizations supporting blood donation</a>
      </div>
    </div>
  );

  return (  <>
    <Nav /> 
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Health Tips for Blood Donors</h1>
        <p style={styles.subtitle}>Learn how to prepare for donation and maintain your health</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'eligible' ? styles.activeTab : styles.inactiveTab)
          }}
          onClick={() => handleTabClick('eligible')}
        >
          Eligible
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'ineligible' ? styles.activeTab : styles.inactiveTab)
          }}
          onClick={() => handleTabClick('ineligible')}
        >
          Ineligible
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'eligible' ? renderEligibleContent() : renderIneligibleContent()}
      </div>
    </div>
    </>
  );
}