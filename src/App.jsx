import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OPDQueue from './pages/OPDQueue';
import BedManagement from './pages/BedManagement';
import MoreOptions from './pages/MoreOptions';
import ProviderPortal from './pages/ProviderPortal';
import MyTickets from './pages/MyTickets';
import AmbulancePage from './pages/AmbulancePage';
import ComparisonDashboard from './pages/ComparisonDashboard';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* GIGW Utility Bar */}
        <div className="utility-bar">
          <div>Government of NCT of Delhi</div>
          <div className="utility-links">
            <span>Skip to Main Content</span>
            <span>A-</span>
            <span>A</span>
            <span>A+</span>
            <span>English | हिन्दी</span>
          </div>
        </div>

        {/* Government Header */}
        <div className="gov-header">
          <div className="gov-title-container">
            <span className="gov-title-hi">स्वास्थ्य एवं परिवार कल्याण विभाग</span>
            <span className="gov-title-en">Department of Health & Family Welfare</span>
          </div>
        </div>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beds" element={<BedManagement />} />
            <Route path="/opd" element={<OPDQueue />} />
            <Route path="/more" element={<MoreOptions />} />
            <Route path="/provider" element={<ProviderPortal />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/ambulance" element={<AmbulancePage />} />
            <Route path="/comparison" element={<ComparisonDashboard />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}
