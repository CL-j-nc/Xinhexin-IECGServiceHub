import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ClaimCenter from './pages/ClaimCenter';
import ConversationHub from './components/ConversationHub';
import ClaimProcessCenter from './pages/ClaimProcessCenter'; // 截图名称一致  
import StaffLogin from './components/StaffLogin';
import StaffDashboard from './pages/StaffDashboard'; // 假设  

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/claim-center" element={<ClaimCenter />} />
            <Route path="/conversation-hub" element={<ConversationHub />} />
            <Route path="/claim-process-hub" element={<ClaimProcessCenter />} />
            <Route path="/staff-login" element={<StaffLogin onLogin={() => { }} onBack={() => { }} />} />
            <Route path="/staff-dashboard" element={<StaffDashboard onExit={() => { }} />} />
        </Routes>
    </Router>
);

export default App;  