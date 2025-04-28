import { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bloodGroup: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const splineRef = useRef(null);
  const animationFrameRef = useRef(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Function to handle the rotation animation
  const startRotation = (obj) => {
    let angle = 0;
    
    const rotate = () => {
      angle += 0.01;
      if (obj) {
        obj.rotation.y = angle;
      }
      animationFrameRef.current = requestAnimationFrame(rotate);
    };
    
    rotate();
  };

  const onSplineLoad = (splineApp) => {
    splineRef.current = splineApp;
    const obj = splineRef.current.findObjectByName('juicebag');
    if (obj) {
      startRotation(obj);
    }
  };

  // Clean up animation frame on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ name: '', email: '', bloodGroup: '', message: '' });
      }, 3000);
    }, 1000);
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100vh', // Full screen
    overflow: 'hidden',
  };

  const leftStyle = {
    flex: '1',
    height: '100%',
    width:'500%',
    // backgroundColor:'#ffe4e6',
  };

  const rightStyle = {
    flex: '1',
    backgroundColor: '#ffe4e6',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '500px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  const successStyle = {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px'
  };

  return (
    <div style={containerStyle}>
      
      {/* Left: Spline Animation */}
      <div style={leftStyle}>
        <Spline
          scene="https://prod.spline.design/UVQSHAbt3Tn722oo/scene.splinecode"
          onLoad={onSplineLoad}
        />
      </div>

      {/* Right: Form */}
      <div style={rightStyle}>
        <div style={formContainerStyle}>
          <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626', marginBottom: '10px' }}>Contact Us</h2>
          <p style={{ marginBottom: '20px', color: '#4B5563' }}>Get in touch with the BloodLink team</p>

          {submitSuccess ? (
            <div style={successStyle}>
              Thank you! We'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
              />

              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />

              <label style={labelStyle}>Blood Group *</label>
              <select
                name="bloodGroup"
                required
                value={formData.bloodGroup}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select your blood group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>

              <label style={labelStyle}>Message *</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}