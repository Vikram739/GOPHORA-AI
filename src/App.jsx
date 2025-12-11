import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';
import './index.css';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import { Route, Routes } from 'react-router-dom';
//import SeekerLayout from './layouts/SeekerLayout';
import SeekerDashboard from './pages/Seeker/Dashboard';
import ProviderDashboard from './pages/Provider/Dashboard';
import ProviderLayout from './layouts/ProviderLayout';
import LandingPage from './pages/Landing/LandingPage';
import Opportunities from './pages/Provider/Opportunities';
import CreateOpportunity from './pages/Provider/CreateOpportunity';
import Profile from './pages/Provider/Profile';
import SeekerOpportunities from './pages/Seeker/Opportunities';
import Applications from './pages/Seeker/Applications';
//import SeekerProfile from './pages/Seeker/Profile';
import PageNotFound from './pages/PageNotFound';
import VerificationForm from './components/forms/VerificationForm';
import AboutUs from './pages/Landing/About';
import ExploreMissions from './pages/Landing/ExploreMissions';
import MainLayout from './layouts/PublicLayout';
import OpportunityDetails from './pages/Seeker/OpportunityDetails';
import CreateProfile from "./components/forms/createProfile"
import OnboardingFlow from './pages/Seeker/OnboardingFlow';
import JobDetail from './pages/Seeker/JobDetail';
import ResumeBuilder from './components/forms/ResumeBuilder';

import Dashboard from './pages/Seeker/dashboard/Dashboard';
import Wallet from "./pages/Seeker/dashboard/wallet/Wallet";
import DashboardLayout from "./layouts/Dashboard"
import Missions from "./pages/Seeker/dashboard/Mission";
import AIAssistant from "./pages/Seeker/dashboard/AiAssistant";
import SeekerProfile from "./pages/Seeker/dashboard/Profile";
import QuickJobs from "./pages/Seeker/dashboard/QuickJobs";
import OpportunitiesMap from "./pages/Seeker/dashboard/OpportunitiesMap";
import BookHistory from "./pages/Seeker/dashboard/BookHistory";
import Onboarding from "./pages/Seeker/dashboard/Onboarding";

// Other imports remain the same...

function App() {
  
  return (
    <Routes>
     <Route element={<MainLayout/>}>

       {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/about' element={<AboutUs/>}/>
      <Route path="/explore-missions" element={<ExploreMissions/>} />
      

      {/* Provider Routes */}
      <Route
        element={
          <ProtectedRoute allowedRole="provider">
            <ProviderLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/verify" element={<VerificationForm/>} />
        <Route path="/provider/opportunities" element={<Opportunities />} />
        <Route path="/provider/create-opportunity" element={<CreateOpportunity />} />
        <Route path="/provider/profile" element={<Profile />} />
      </Route>

      {/* Seeker Routes */}
      <Route
        element={
          <ProtectedRoute allowedRole="seeker">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="seeker/dashboard" element={<Dashboard/>}/>
        <Route path="seeker/dashboard/resume" element={<ResumeBuilder/>}/>
        <Route path="seeker/dashboard/wallet" element={<Wallet />}/>
        <Route path="seeker/dashboard/missions" element={<Missions/>} />
        <Route  path="seeker/dashboard/assistant" element={<AIAssistant/>}/>
        <Route path="seeker/dashboard/profile" element={<SeekerProfile/>}/>
        <Route path="seeker/dashboard/jobs" element={<QuickJobs/>}/>
        <Route path="seeker/dashboard/opportunities-map" element={<OpportunitiesMap />}/>
        <Route path="dashboard/job/:id" element={<JobDetail/>} />
        <Route path="seeker/dashboard/book-history" element={<BookHistory />}/>
        <Route path="seeker/dashboard/onboarding" element={<Onboarding />}/>
        <Route path="/seeker/opportunities" element={<SeekerOpportunities />} />
        <Route path="/seeker/applications" element={<Applications />} />
        <Route path="/seeker/resume" element={<CreateProfile/>}/>
        <Route path="/seeker/onboarding" element={<OnboardingFlow />} />
      </Route>

      {/* Other routes */}
      <Route path="*" element={<PageNotFound />} />
     </Route>
    </Routes>
  );
}

 
export default App;
