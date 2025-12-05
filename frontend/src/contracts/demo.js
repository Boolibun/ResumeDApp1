// Demo mode to test the interface without deployed contracts
export const DEMO_MODE = !import.meta.env.VITE_PORTFOLIO_NFT_ADDRESS;

export const DEMO_CONTRACT_ADDRESSES = {
  PORTFOLIO_TOKEN: "0x1234567890123456789012345678901234567890",
  PORTFOLIO_NFT: "0x2345678901234567890123456789012345678901", 
  STAKING_MANAGER: "0x3456789012345678901234567890123456789012",
  NFT_MARKETPLACE: "0x4567890123456789012345678901234567890123",
};

export const DEMO_USER_DATA = {
  hasClaimed: true,
  tokenBalance: "150000000000000000000", // 150 tokens
  stakingInfo: [
    {
      tokenId: 1,
      stakedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      lastRewardClaimed: Math.floor(Date.now() / 1000) - 86400,
      rarity: 0, // Common
    }
  ],
  pendingRewards: "1000000000000000000", // 1 token
};