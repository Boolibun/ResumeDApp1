#!/usr/bin/env node

import { ethers } from 'ethers';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Import commands
import { displayBalance } from './commands/balance.js';
import { claimFaucet, checkFaucetStatus } from './commands/faucet.js';
import { stakeTokens, unstakeTokens, stakeNFT, unstakeNFT, claimRewards } from './commands/staking.js';
import { viewMarketplace, purchaseNFT, batchPurchaseNFTs } from './commands/marketplace.js';
import { getContracts, ADDRESSES } from './utils/contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log(chalk.yellow('\n⚠️  No .env file found. Please create one based on .env.example\n'));
  process.exit(1);
}

// Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}       ${chalk.bold.white('Portfolio DApp - CLI Interface')}            ${chalk.cyan('║')}
${chalk.cyan('║')}       ${chalk.gray('Interact with smart contracts via terminal')}  ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════╝')}
`;

// Main menu choices
const mainMenuChoices = [
  { name: '💰 Check Balance', value: 'balance' },
  { name: '💧 Faucet - Claim Tokens', value: 'faucet' },
  { name: '🔍 Check Faucet Status', value: 'faucet_status' },
  new inquirer.Separator(),
  { name: '🔒 Stake Tokens', value: 'stake_tokens' },
  { name: '🔓 Unstake Tokens', value: 'unstake_tokens' },
  { name: '🎨 Stake NFT', value: 'stake_nft' },
  { name: '🖼️  Unstake NFT', value: 'unstake_nft' },
  { name: '💸 Claim Staking Rewards', value: 'claim_rewards' },
  new inquirer.Separator(),
  { name: '🏪 View Marketplace', value: 'view_marketplace' },
  { name: '🛒 Purchase NFT', value: 'purchase_nft' },
  { name: '📦 Batch Purchase NFTs', value: 'batch_purchase' },
  new inquirer.Separator(),
  { name: '🔄 Refresh', value: 'refresh' },
  { name: '❌ Exit', value: 'exit' }
];

/**
 * Setup provider and wallet
 */
async function setupWallet() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.log(chalk.red('\n❌ Missing required environment variables.'));
    console.log(chalk.yellow('Please set SEPOLIA_RPC_URL and PRIVATE_KEY in .env file\n'));
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Test connection
    await provider.getNetwork();

    return { provider, wallet };
  } catch (error) {
    console.log(chalk.red(`\n❌ Failed to connect to network: ${error.message}\n`));
    process.exit(1);
  }
}

/**
 * Display wallet info
 */
function displayWalletInfo(address) {
  console.log(chalk.gray(`\n📍 Connected Wallet: ${address}`));
  console.log(chalk.gray(`🌐 Network: Sepolia Testnet\n`));

  // Display contract addresses
  console.log(chalk.cyan('📋 Contract Addresses:'));
  console.log(chalk.white(`  Portfolio Token: ${ADDRESSES.PortfolioToken}`));
  console.log(chalk.white(`  Faucet: ${ADDRESSES.PFTFaucet}`));
  console.log(chalk.white(`  Portfolio NFT: ${ADDRESSES.PortfolioNFT}`));
  console.log(chalk.white(`  Staking Manager: ${ADDRESSES.StakingManager}`));
  console.log(chalk.white(`  NFT Marketplace: ${ADDRESSES.NFTMarketplace}`));
  console.log('');
}

/**
 * Main menu
 */
async function mainMenu(contracts, address) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: mainMenuChoices,
      loop: false
    }
  ]);

  switch (action) {
    case 'balance':
      await displayBalance(contracts, address);
      break;
    case 'faucet':
      await claimFaucet(contracts, address);
      break;
    case 'faucet_status':
      await checkFaucetStatus(contracts, address);
      break;
    case 'stake_tokens':
      await stakeTokens(contracts, address);
      break;
    case 'unstake_tokens':
      await unstakeTokens(contracts, address);
      break;
    case 'stake_nft':
      await stakeNFT(contracts, address);
      break;
    case 'unstake_nft':
      await unstakeNFT(contracts, address);
      break;
    case 'claim_rewards':
      await claimRewards(contracts, address);
      break;
    case 'view_marketplace':
      await viewMarketplace(contracts);
      break;
    case 'purchase_nft':
      await purchaseNFT(contracts, address);
      break;
    case 'batch_purchase':
      await batchPurchaseNFTs(contracts, address);
      break;
    case 'refresh':
      console.clear();
      console.log(banner);
      displayWalletInfo(address);
      break;
    case 'exit':
      console.log(chalk.cyan('\n👋 Goodbye!\n'));
      process.exit(0);
  }

  // Return to main menu
  await mainMenu(contracts, address);
}

/**
 * Main function
 */
async function main() {
  console.clear();
  console.log(banner);

  try {
    // Setup wallet and provider
    const { wallet } = await setupWallet();
    const address = wallet.address;

    // Get contract instances
    const contracts = getContracts(wallet);

    // Display wallet info
    displayWalletInfo(address);

    // Start main menu
    await mainMenu(contracts, address);

  } catch (error) {
    console.log(chalk.red(`\n❌ Fatal error: ${error.message}\n`));
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.log(chalk.red(`\n❌ Unhandled error: ${error.message}\n`));
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

// Run
main();
