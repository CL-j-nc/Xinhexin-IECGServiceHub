import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLogin from '../components/StaffLogin';
import ConversationHub from '../components/ConversationHub';

const StaffDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <StaffLogin
        onLogin={() => setIsAuthenticated(true)}
        onBack={() => navigate('/')}
      />
    );
  }

  return <ConversationHub onExit={() => setIsAuthenticated(false)} />;
};

export default StaffDashboard;
