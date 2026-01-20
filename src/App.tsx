import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ServiceHub from './components/ServiceHub';
import ConversationHub from './components/ConversationHub';
import StaffDashboard from './pages/StaffDashboard';
import ClaimCenter from './pages/ClaimCenter';
import ClaimProcessCenter from './pages/ClaimProcessCenter';

const App: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/service-hub" element={<ServiceHub />} />
            <Route path="/conversation-hub" element={<ConversationHub onExit={() => window.location.href = '/'} />} />
            <Route path="/claim-center" element={<ClaimCenter />} />
            <Route path="/claim-process" element={<ClaimProcessCenter />} />
            <Route path="/staff-dashboard" element={<StaffDashboard />} />
        </Routes>
    </Router>
);

export default App;