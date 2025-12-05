import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { config } from './config/wagmi';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MatrixRain from './components/MatrixRain';
import NFTDetail from './components/NFTDetail';
import { useAccount } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function AppContent() {
  const { isConnected } = useAccount();

  return (
    <Router>
      <div className="min-h-screen relative" style={{background: 'rgba(0, 0, 0, 0.96)'}}>
        <MatrixRain />
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/nft/:id" element={<NFTDetail />} />
            <Route path="/" element={
              isConnected ? (
                <Dashboard />
              ) : (
                <main className="container mx-auto px-4 py-8">
                  <Hero />
                </main>
              )
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en-US">
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;