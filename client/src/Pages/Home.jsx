import { useState } from 'react';
import Nav from '../components/Nav';
import BloodDonationForm from './BloodDonationForm';
import FindCenters from '../components/NearbyCenters';
import NotificationPage from '../components/NotificationSystem';
import ContactUs from './ContactUs';
import Inventory from './InventoryPrediction';
import InventoryForecast from '../components/InventoryForecast';
import DonationPage from '../components/Donation';
import HealthTips from './HealthTips';
import BackButton from '../components/BackButton';
import BloodImage from '../assets/Blood.webp';
export default function BloodDonationWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Using the exact red color from the reference images
  const primaryRed = '#d92027';
  const lightGray = '#f8f9fa';
  const darkGray = '#343a40';
  const textDark = '#212529';
  const textLight = '#6c757d';

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch(currentPage) {
      case 'create-profile':
        return (
          <>
            {/* <BackButton navigateTo={navigateTo} /> */}
            <BloodDonationForm navigateTo={navigateTo} />
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'find-centers':
        return (
          <>
            
            <FindCenters navigateTo={navigateTo} />
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'reminders':
        return (
          <>
            
            <NotificationPage navigateTo={navigateTo} />
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'contact-us':
        return (
          <>
            
            <ContactUs navigateTo={navigateTo} />
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'inventory':
        return (
          <>
            
            <Inventory navigateTo={navigateTo} />
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'inventory-forecast':
        return (
          <>
            
            <InventoryForecast navigateTo={navigateTo} />
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Inventory Forecast</h2>
              <p>This feature is coming soon.</p>
            </div>
            <BackButton navigateTo={navigateTo} />
          </>
        );
      case 'donation':
        return (
          <>
            
            <DonationPage navigateTo={navigateTo} /><BackButton navigateTo={navigateTo} />
          </>
        );
      case 'health-tips':
        return (
          <>
            
            <HealthTips navigateTo={navigateTo} /><BackButton navigateTo={navigateTo} />
          </>
        );
      case 'book-slot':
        return (
          <>
            {/* <BackButton navigateTo={navigateTo} /> */}
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Book Donation Slot</h2>
              <p>Select your preferred donation center and time slot.</p>
              {/* Booking form would go here */}
            </div>
          </>
        );
      default:
        return renderHomePage();
    }
  };

  const renderHomePage = () => {
    return (
      <>
      <Nav />
        {/* Hero Section - Made larger */}
        <div style={{ 
          backgroundColor: primaryRed, 
          color: 'white', 
          padding: '4rem 2rem', 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: '500px'
        }}>
          <div style={{ flex: '1', paddingRight: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Give the Gift of Life</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Join our community of blood donors and help save lives. Find donation centers, book slots, and track your donation history all in one place.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                style={{ 
                  padding: '1rem 2rem', 
                  backgroundColor: 'white', 
                  color: primaryRed, 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
                onClick={() => navigateTo('create-profile')}
              >
                Become a Donor
              </button>
              <button 
                style={{ 
                  padding: '1rem 2rem', 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  border: '1px solid white', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
                onClick={() => navigateTo('find-centers')}
              >
                Find Donation Centers
              </button>
            </div>
          </div>
          <div style={{ flex: '1', maxWidth: '500px' }}>
            <img 
              // src="https://bloodonwheels.in/wp-content/uploads/2023/07/Mask-group-8.png"
              src={BloodImage}
              alt="Blood donation process" 
              
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{ padding: '3rem 2rem', backgroundColor: lightGray }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem' }}>How BloodLink Works</h2>
          <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem', color: textLight, fontSize: '1.1rem' }}>
            Our platform makes blood donation simple, efficient, and accessible for everyone.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>👤</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Create Profile</h3>
              <p style={{ color: textLight }}>Sign up and complete your profile with your blood type and health information.</p>
              <button 
                onClick={() => navigateTo('create-profile')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Create Profile
              </button>
            </div>
            
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>📍</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Find Centers</h3>
              <p style={{ color: textLight }}>Locate nearby donation centers with real-time availability information.</p>
              <button 
                onClick={() => navigateTo('find-centers')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Find Centers
              </button>
            </div>
            
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>📅</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Book Slots</h3>
              <p style={{ color: textLight }}>Schedule your donation at your preferred time and location.</p>
              <button 
                onClick={() => navigateTo('book-slot')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Book Slot
              </button>
            </div>
            
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>🔔</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Get Reminders</h3>
              <p style={{ color: textLight }}>Receive notifications about upcoming appointments and when you're eligible to donate again.</p>
              <button 
                onClick={() => navigateTo('reminders')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Set Reminders
              </button>
            </div>
            {/* NEW Health Tips Box */}
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>💪</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Health Tips</h3>
              <p style={{ color: textLight }}>Get expert advice on staying healthy before and after donation.</p>
              <button 
                onClick={() => navigateTo('health-tips')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                View Health Tips
              </button>
            </div>

            {/* NEW Inventory Forecast Box */}
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>📈</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Inventory Forecast</h3>
              <p style={{ color: textLight }}>See predictions of future blood supply needs and plan donations accordingly.</p>
              <button 
                onClick={() => navigateTo('inventory-forecast')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                View Forecast
              </button>
            </div>

            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>📊</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Inventory</h3>
              <p style={{ color: textLight }}>View current blood inventory levels and see where your donation is needed most.</p>
              <button 
                onClick={() => navigateTo('inventory')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Check Inventory
              </button>
            </div>

            <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#ffebee', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: primaryRed, fontSize: '1.8rem' }}>📞</div>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Contact Us</h3>
              <p style={{ color: textLight }}>Have questions? Reach out to our team for assistance with any concerns.</p>
              <button 
                onClick={() => navigateTo('contact-us')}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: primaryRed, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Map Section - Always visible */}
        <div style={{ padding: '3rem 2rem', backgroundColor: 'white' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '2.2rem' }}>Find Donation Centers Near You</h2>
          <p style={{ marginBottom: '1.5rem', color: textLight, fontSize: '1.1rem' }}>Our interactive map helps you locate the nearest blood donation centers. Check real-time availability and book your slot in just a few clicks.</p>
          
          <button 
            onClick={() => navigateTo('find-centers')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: primaryRed, 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
          >
            View Full Map
          </button>
          
          {/* Map is always visible now */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem', height: '400px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '150px', height: '150px', backgroundColor: 'rgba(100, 100, 255, 0.3)', borderRadius: '50%', border: '2px solid rgba(100, 100, 255, 0.5)' }}></div>
            <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="https://static.squareyards.com/localitymap-thumnail/lal-kothi-jaipur.png?aio=w-763;h-428;crop;" alt="Map of donation centers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '5px 10px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>12 centers found</p>
              </div>
              {Array(8).fill().map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    position: 'absolute', 
                    left: `${20 + Math.random() * 60}%`, 
                    top: `${20 + Math.random() * 60}%`, 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: primaryRed, 
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px white'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Blood Type Compatibility Chart - Expanded */}
        <div style={{ padding: '3rem 2rem', backgroundColor: lightGray }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem' }}>Blood Type Compatibility</h2>
          <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem', color: textLight, fontSize: '1.1rem' }}>
            Understanding blood type compatibility is crucial for effective donations and transfusions.
          </p>
          
          <div style={{ maxWidth: '1500px', margin: '0 auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: primaryRed, color: 'white', padding: '1.5rem', textAlign: 'left', fontSize: '1.2rem' }}>Blood Type</th>
                  <th style={{ backgroundColor: primaryRed, color: 'white', padding: '1.5rem', textAlign: 'left', fontSize: '1.2rem' }}>Can Donate To</th>
                  <th style={{ backgroundColor: primaryRed, color: 'white', padding: '1.5rem', textAlign: 'left', fontSize: '1.2rem' }}>Can Receive From</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A+, AB+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A+, A-, O+, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A+, A-, AB+, AB-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A-, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B+, AB+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B+, B-, O+, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B+, B-, AB+, AB-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>B-, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>AB+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>AB+ only</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>All blood types</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>AB-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>AB+, AB-</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A-, B-, AB-, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>O+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>A+, B+, AB+, O+</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', fontSize: '1.1rem' }}>O+, O-</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '1.1rem' }}>O-</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '1.1rem' }}>All blood types</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '1.1rem' }}>O- only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ padding: '4rem 2rem', backgroundColor: primaryRed, color: 'white', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Ready to Save Lives?</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.2rem' }}>
          I got a second chance at life because of BloodLink. Today, I choose to give someone else that chance. Want to join me? You can donate money and make it happen.
          </p>
          <button 
            onClick={() => navigateTo('donation')}
            style={{ 
              padding: '1rem 2.5rem', 
              backgroundColor: 'white', 
              color: primaryRed, 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            Donate Money Now
          </button>
        </div>

        {/* Footer */}
        <footer style={{ backgroundColor: darkGray, color: 'white', padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', gap: '2rem' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: primaryRed, marginRight: '8px' }}>💧</span> BloodLink
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>
                Connecting blood donors with those in need, making the donation process simple and accessible.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ cursor: 'pointer' }}>📱</span>
                <span style={{ cursor: 'pointer' }}>💻</span>
                <span style={{ cursor: 'pointer' }}>📸</span>
              </div>
            </div>
            
            <div style={{ flex: '1', minWidth: '150px' }}>
              <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Home</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('find-centers'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Find Centers</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('inventory-forecast'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Inventory Forecast</a></li>
              </ul>
            </div>
            
            <div style={{ flex: '1', minWidth: '150px' }}>
              <h4 style={{ marginBottom: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('health-tips'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Health Tips</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('inventory'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Inventory</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('contact-us'); }} style={{ color: '#ccc', textDecoration: 'none' }}>Contact Us</a></li>
              </ul>
            </div>
            
            {/* <div style={{ flex: '1', minWidth: '200px' }}>
              <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '0.5rem' }}>Email: contact@bloodlink.com</li>
                <li style={{ marginBottom: '0 */}
            <div style={{ flex: '1', minWidth: '200px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              <li style={{ marginBottom: '0.5rem' }}>Email: contact@bloodlink.com</li>
              <li style={{ marginBottom: '0.5rem' }}>Phone: (123) 456-7890</li>
              <li style={{ marginBottom: '0.5rem' }}>Emergency: (123) 456-7899</li>
            </ul>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #555', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
          <p>© 2025 BloodLink Inc. | <a href="#" style={{ color: '#999' }}>Privacy Policy</a> | <a href="#" style={{ color: '#999' }}>Terms of Service</a></p>
        </div>
      </footer>
    </>
  );
};

return (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '100%', margin: '0 auto', color: textDark }}>
    {/* <Nav /> */}
    {renderPage()}
  </div>
);
}