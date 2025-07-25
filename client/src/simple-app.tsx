// Minimal working app to bypass React Hook errors
import React, { useState } from 'react';

export default function SimpleApp() {
  const [showLogin, setShowLogin] = useState(true);
  
  if (showLogin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e6f7ff 0%, #b3e0ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>∞</span>
          </div>
          <h1 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '32px' }}>Welcome to Senali</h1>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '18px' }}>
            Your AI parenting coach and friend
          </p>
          
          <button 
            onClick={() => setShowLogin(false)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Continue with Demo
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e6f7ff 0%, #b3e0ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Family Profiles</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Create profiles for your family members to get personalized support.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => {
              fetch('/api/children/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  childName: 'Test Child',
                  age: '8',
                  relationshipToUser: 'child'
                })
              }).then(() => alert('Profile created successfully!'));
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Add Test Profile
          </button>
          
          <button 
            onClick={() => {
              fetch('/api/children')
                .then(res => res.json())
                .then(data => alert(`Found ${data.length} profiles: ${JSON.stringify(data, null, 2)}`));
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Show Profiles
          </button>
        </div>
        
        <button 
          onClick={() => setShowLogin(true)}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}