import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ServiceHub from './pages/ServiceHub';
import PolicyQuery from './pages/service/PolicyQuery';
import PolicyChange from './pages/service/PolicyChange';
import EndorsementManagement from './pages/service/EndorsementManagement';
import CustomerServiceHub from './pages/CustomerServiceHub';
import ClaimCenter from './pages/ClaimCenter';
import ClaimProcessCenter from './pages/ClaimProcessCenter';
import StaffLogin from './components/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import CRMVehicleSearch from './pages/CRMVehicleSearch';
import CRMVehicleDetail from './pages/CRMVehicleDetail';
import GroupUnderwritingCenter from './pages/GroupUnderwritingCenter';
import CRMDashboard from './pages/CRMDashboard';
import UnderwritingLookup from './pages/UnderwritingLookup';

import AuthorityDocumentCenter from './pages/AuthorityDocumentCenter';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/group-underwriting-center" element={<GroupUnderwritingCenter />} />
      <Route path="/crm-dashboard" element={<CRMDashboard />} />
      <Route path="/service-hub" element={<ServiceHub />} />
      <Route path="/service-hub/query" element={<PolicyQuery />} />
      <Route path="/service-hub/change" element={<PolicyChange />} />
      <Route path="/service-hub/endorsement" element={<EndorsementManagement />} />
      <Route path="/customer-service" element={<CustomerServiceHub />} />
      <Route path="/claim-center" element={<ClaimCenter />} />
      <Route path="/claim-process-hub" element={<ClaimProcessCenter />} />
      <Route path="/authority-center" element={<AuthorityDocumentCenter />} />
      <Route path="/crm/search" element={<CRMVehicleSearch />} />
      <Route path="/crm/vehicle/:plateOrVin" element={<CRMVehicleDetail />} />
      <Route path="/underwriting-lookup" element={<UnderwritingLookup />} />
      <Route path="/staff-login" element={<StaffLogin onLogin={() => { }} onBack={() => { }} />} />
      <Route
        path="/staff-dashboard"
        element={<StaffDashboard onExit={() => window.location.href = '/'} />}
      />
      <Route path="/conversation-hub" element={<Navigate to="/staff-dashboard" replace />} />
    </Routes>
  </Router>
);

export default App;
