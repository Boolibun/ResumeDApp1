import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load deployment addresses
const deploymentsPath = join(__dirname, '../../contracts/deployments/sepolia.json');
const deployments = JSON.parse(readFileSync(deploymentsPath, 'utf8'));

// Load ABIs from compiled contracts
const loadABI = (contractName) => {
  const artifactPath = join(__dirname, `../../contracts/artifacts/contracts/${contractName}.sol/${contractName}.json`);
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
  return artifact.abi;
};

// Contract ABIs
export const ABIS = {
  PortfolioToken: loadABI('PortfolioToken'),
  PFTFaucet: loadABI('PFTFaucet'),
  PortfolioNFT: loadABI('PortfolioNFT'),
  StakingManager: loadABI('StakingManager'),
  NFTMarketplace: loadABI('NFTMarketplace')
};

// Contract addresses
export const ADDRESSES = {
  PortfolioToken: deployments.contracts.PORTFOLIO_TOKEN,
  PFTFaucet: deployments.contracts.PFT_FAUCET,
  PortfolioNFT: deployments.contracts.PORTFOLIO_NFT,
  StakingManager: deployments.contracts.STAKING_MANAGER,
  NFTMarketplace: deployments.contracts.NFT_MARKETPLACE
};

/**
 * Get contract instances
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {Object} Contract instances
 */
export const getContracts = (signer) => {
  return {
    portfolioToken: new ethers.Contract(ADDRESSES.PortfolioToken, ABIS.PortfolioToken, signer),
    faucet: new ethers.Contract(ADDRESSES.PFTFaucet, ABIS.PFTFaucet, signer),
    portfolioNFT: new ethers.Contract(ADDRESSES.PortfolioNFT, ABIS.PortfolioNFT, signer),
    stakingManager: new ethers.Contract(ADDRESSES.StakingManager, ABIS.StakingManager, signer),
    nftMarketplace: new ethers.Contract(ADDRESSES.NFTMarketplace, ABIS.NFTMarketplace, signer)
  };
};

/**
 * Format token amount from wei
 * @param {BigInt} amount - Amount in wei
 * @returns {string} Formatted amount
 */
export const formatTokens = (amount) => {
  return ethers.formatEther(amount);
};

/**
 * Parse token amount to wei
 * @param {string} amount - Amount in tokens
 * @returns {BigInt} Amount in wei
 */
export const parseTokens = (amount) => {
  return ethers.parseEther(amount);
};
