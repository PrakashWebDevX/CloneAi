import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PersonalityProvider } from './context/PersonalityContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TrainPage from './pages/TrainPage';
import ChatPage from './pages/ChatPage';
import './index.css';

export default function App() {
  return (
    <PersonalityProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg text-white font-body">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1c1c28',
                color: '#f0eef8',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif'
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#1c1c28' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#1c1c28' } }
            }}
          />
        </div>
      </BrowserRouter>
    </PersonalityProvider>
  );
}
