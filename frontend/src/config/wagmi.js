import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, localhost } from 'wagmi/chains';
import { http } from 'wagmi';

// Custom Sepolia configuration with our Infura RPC
const customSepolia = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/12093cf3e306477c9e90dd4db57a3986']
    },
    public: {
      http: [import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/12093cf3e306477c9e90dd4db57a3986']
    }
  }
};

export const config = getDefaultConfig({
  appName: 'Portfolio DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [customSepolia, localhost],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
    [localhost.id]: http(),
  },
  ssr: false,
});