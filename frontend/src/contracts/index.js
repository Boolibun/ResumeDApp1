import { DEMO_MODE, DEMO_CONTRACT_ADDRESSES } from './demo';
import DEPLOYED_ADDRESSES from './addresses.json';

// Contract addresses - Updated with new deployments
export const CONTRACT_ADDRESSES = DEMO_MODE ? DEMO_CONTRACT_ADDRESSES : {
  PORTFOLIO_TOKEN: DEPLOYED_ADDRESSES.PortfolioToken || import.meta.env.VITE_PORTFOLIO_TOKEN_ADDRESS || '',
  PORTFOLIO_NFT: DEPLOYED_ADDRESSES.PortfolioNFT || import.meta.env.VITE_PORTFOLIO_NFT_ADDRESS || '',
  PFT_FAUCET: DEPLOYED_ADDRESSES.PFTFaucet || import.meta.env.VITE_PFT_FAUCET_ADDRESS || '',
  STAKING_MANAGER: DEPLOYED_ADDRESSES.StakingManager || import.meta.env.VITE_STAKING_MANAGER_ADDRESS || '',
  NFT_MARKETPLACE: DEPLOYED_ADDRESSES.NFTMarketplace || import.meta.env.VITE_NFT_MARKETPLACE_ADDRESS || '',
};

// ABI JSON pour le frontend
export const PORTFOLIO_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
];

export const PFT_FAUCET_ABI = [
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "canClaim",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getTimeUntilNextClaim",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {"internalType": "bool", "name": "canClaimNow", "type": "bool"},
      {"internalType": "uint256", "name": "timeUntilNextClaim", "type": "uint256"},
      {"internalType": "uint256", "name": "totalClaimedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "lastClaim", "type": "uint256"},
      {"internalType": "uint256", "name": "claimedToday", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FAUCET_AMOUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "COOLDOWN_PERIOD",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "faucetActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxDailyLimit",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "claimer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "nextClaimTime", "type": "uint256"}
    ],
    "name": "TokensClaimed",
    "type": "event"
  }
];

export const PORTFOLIO_NFT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"},
      {"internalType": "bool", "name": "approved", "type": "bool"}
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "nftId", "type": "uint256"}],
    "name": "getNFTMetadata",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "imageUri", "type": "string"},
        {"internalType": "uint8", "name": "rarity", "type": "uint8"},
        {"internalType": "uint256", "name": "tokenReward", "type": "uint256"},
        {"internalType": "bool", "name": "exists", "type": "bool"}
      ],
      "internalType": "struct PortfolioNFT.NFTMetadata",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getOwnedTokens",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]"}],
    "name": "getMultipleNFTMetadata",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "imageUri", "type": "string"},
        {"internalType": "uint8", "name": "rarity", "type": "uint8"},
        {"internalType": "uint256", "name": "tokenReward", "type": "uint256"},
        {"internalType": "bool", "name": "exists", "type": "bool"}
      ],
      "internalType": "struct PortfolioNFT.NFTMetadata[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "nftId", "type": "uint256"}],
    "name": "isAvailableForMint",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
];

export const STAKING_MANAGER_ABI = [
  // NFT Staking
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "stakeNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]"}],
    "name": "stakeMultipleNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "unstakeNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]"}],
    "name": "unstakeMultipleNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getNFTStakingInfo",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
        {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
        {"internalType": "uint256", "name": "lastRewardClaimed", "type": "uint256"},
        {"internalType": "uint8", "name": "rarity", "type": "uint8"}
      ],
      "internalType": "struct StakingManager.NFTStakingInfo[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Token Staking
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "stakeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "stakingIndex", "type": "uint256"}],
    "name": "unstakeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getTokenStakingInfo",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
        {"internalType": "uint256", "name": "lastRewardClaimed", "type": "uint256"}
      ],
      "internalType": "struct StakingManager.TokenStakingInfo[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // General
  {
    "inputs": [],
    "name": "claimAllRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getAllPendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getAllUserInfo",
    "outputs": [{
      "components": [
        {
          "components": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "lastRewardClaimed", "type": "uint256"},
            {"internalType": "uint8", "name": "rarity", "type": "uint8"}
          ],
          "internalType": "struct StakingManager.NFTStakingInfo[]",
          "name": "nftStakings",
          "type": "tuple[]"
        },
        {
          "components": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "lastRewardClaimed", "type": "uint256"}
          ],
          "internalType": "struct StakingManager.TokenStakingInfo[]",
          "name": "tokenStakings",
          "type": "tuple[]"
        },
        {"internalType": "uint256", "name": "totalPendingRewards", "type": "uint256"},
        {"internalType": "uint256", "name": "nftPendingRewards", "type": "uint256"},
        {"internalType": "uint256", "name": "tokenPendingRewards", "type": "uint256"}
      ],
      "internalType": "struct StakingManager.UserStakingInfo",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardRatePerSecond",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const NFT_MARKETPLACE_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "nftId", "type": "uint256"}],
    "name": "purchaseNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "nftIds", "type": "uint256[]"}],
    "name": "purchaseMultipleNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "nftId", "type": "uint256"}],
    "name": "getNFTPrice",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "nftId", "type": "uint256"}
    ],
    "name": "hasUserPurchased",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableNFTs",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getMarketplaceInfo",
    "outputs": [{
      "components": [
        {"internalType": "uint256[]", "name": "availableNFTs", "type": "uint256[]"},
        {"internalType": "uint256[]", "name": "prices", "type": "uint256[]"},
        {"internalType": "bool[]", "name": "alreadyPurchased", "type": "bool[]"},
        {"internalType": "uint256[]", "name": "alreadyOwned", "type": "uint256[]"},
        {"internalType": "uint256", "name": "userTokenBalance", "type": "uint256"}
      ],
      "internalType": "struct NFTMarketplace.MarketplaceInfo",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "nftId", "type": "uint256"}
    ],
    "name": "canPurchaseNFT",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"},
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// NFT metadata for the frontend
export const NFT_DATA = {
  1: {
    id: 1,
    title: "IT Support Technician",
    description: "Technical support for hospitals and pharmacies across France",
    skills: ["Technical Support", "Healthcare Software", "Customer Service"],
    rarity: "Common",
    price: 0, // Free claim
    image: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreielv7j46od3awli4bkyt6uxbobees6bfirraxr3y6cwqqps27eiue",
    details: "Provided technical support to healthcare facilities using specialized medical management software.",
    period: "2020 - 2022",
    location: "La Roche-sur-Foron (74), France / Computer Engineering",
    detailedDescription: "As an IT Support Technician at Computer Engineering, I was responsible for providing comprehensive technical support to hospitals and pharmacies throughout France. I specialized in assisting healthcare professionals with a sophisticated medical management software suite that handled critical operations including pharmacy inventory management, medication dispensing, chemotherapy treatment management, and various other essential medical services. This role required not only technical expertise but also the ability to communicate complex technical concepts to healthcare professionals in high-pressure environments, ensuring minimal downtime and optimal patient care continuity.",
    achievements: [
      "Provided daily technical support to 50+ hospitals and pharmacies across France",
      "Managed critical incidents for medical software handling pharmacy inventory, medication dispensing, and chemotherapy treatments",
      "Trained healthcare staff on software usage and best practices",
      "Maintained detailed documentation and knowledge base for common issues"
    ],
    technologies: ["Medical Software Systems", "SQL Database", "Remote Support Tools", "Ticketing Systems"],
    links: [
      {
        title: "Computer Engineering",
        url: "https://computer-engineering.fr"
      }
    ]
  },
  2: {
    id: 2,
    title: "Full-Stack Designer & Developer",
    description: "Complete design and development of the WeDriive platform",
    skills: ["React", "Node.js", "TypeScript"],
    rarity: "Rare",
    price: 50,
    image: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreihrp6hsmoxpranx7vd6klzy655wb7wqbdbuk236ta4wiqayeo645q",
    details: "Complete car conveyance platform with automated workflow management, from front-end to back-end.",
    period: "March 2025 - October 2025",
    location: "Remote / WeDriive",
    detailedDescription: "As Full-Stack Designer & Developer at WeDriive, I had the opportunity to design and develop their entire car conveyance platform. This ambitious project involved creating an end-to-end solution to automate the vehicle conveyance process, from initial booking to final delivery. I took charge of the complete application architecture, ensuring consistency between front-end and back-end while guaranteeing a smooth and intuitive user experience. This experience allowed me to master the entire development cycle of a modern web platform, from design to production deployment.",
    achievements: [
      "Developed an automated car conveyance workflow, including user management, vehicle tracking, and real-time notifications",
      "Implemented a secure payment and online booking system with transaction management",
      "Optimized performance and established a scalable architecture to support platform growth",
      "Created a responsive and intuitive user interface for both customers and drivers",
      "Set up a multi-channel notification system (email, SMS, push) to track conveyance status",
      "Developed an admin dashboard for complete operations management"
    ],
    technologies: ["React", "Next", "TypeScript", "Node.js", "Express", "SupaBase", "Stripe", "Socket.io"],
    links: [
      {
        title: "WeDriive Platform",
        url: "https://wedriive.fr"
      }
    ]
  },
  3: {
    id: 3,
    title: "Technical Lead / Blockchain Developer",
    description: "Multi-chain bot development for secure and anonymous fund transfers",
    skills: ["Solidity", "Multi-Chain", "Team Leadership"],
    rarity: "Epic",
    price: 150,
    image: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreihmogpule43jb6jgc6ncqz2v2mdjcrttysdnvrpj5uqwwubt6vgqa",
    details: "Led blockchain development team in creating a sophisticated multi-chain bot for secure fund transfers with anonymization capabilities.",
    period: "April 2023 - January 2024",
    location: "Remote - Bangkok / Magibot",
    detailedDescription: "As Technical Lead and Blockchain Developer at Magibot, I led a talented team of blockchain developers in designing and building a cutting-edge multi-chain bot system. This sophisticated solution enabled anonymous and secure fund transfers across multiple blockchain networks. My role encompassed both technical leadership and hands-on development, from architecture design to smart contract deployment. I was responsible for ensuring the highest standards of security through comprehensive auditing processes, robust testing frameworks, and close collaboration with stakeholders to deliver a scalable and reliable solution that met stringent security and performance requirements.",
    achievements: [
      "Led and coordinated a blockchain development team throughout the project lifecycle",
      "Designed and developed a multi-chain bot enabling anonymization and secure fund transfers across multiple blockchains",
      "Deployed audited and secure Solidity smart contracts for each target network",
      "Implemented comprehensive unit tests and stress tests to ensure bot robustness and security",
      "Established close collaboration with stakeholders to define features and ensure scalability",
      "Architected cross-chain communication protocols ensuring seamless interoperability"
    ],
    technologies: ["Solidity", "Hardhat", "Ethers.js", "Multi-Chain Architecture", "Node.js", "TypeScript", "Web3"],
    
  }
};

export const RARITY_COLORS = {
  Common: 'rarity-common',
  Rare: 'rarity-rare', 
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
};