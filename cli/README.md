# Portfolio DApp CLI

Command-line interface for interacting with Portfolio DApp smart contracts directly from your terminal.

## Features

- 💰 Check token and NFT balances
- 💧 Claim free tokens from faucet
- 🔒 Stake/unstake tokens and NFTs
- 💸 Claim staking rewards
- 🏪 View and purchase NFTs from marketplace
- 📦 Batch purchase multiple NFTs

## Installation

1. Navigate to the CLI directory:
```bash
cd cli
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

## Usage

Start the CLI:
```bash
npm start
```

Or:
```bash
npm run cli
```

## Available Commands

### Balance & Info
- **Check Balance** - View your PFT tokens, NFTs, staked assets, and pending rewards

### Faucet
- **Claim Tokens** - Get free PFT tokens (24-hour cooldown)
- **Check Faucet Status** - See when you can claim next

### Staking
- **Stake Tokens** - Stake PFT tokens to earn rewards
- **Unstake Tokens** - Unstake your PFT tokens
- **Stake NFT** - Stake your Portfolio NFT to earn rewards
- **Unstake NFT** - Unstake your Portfolio NFT
- **Claim Rewards** - Claim accumulated staking rewards

### Marketplace
- **View Marketplace** - See available NFTs and prices
- **Purchase NFT** - Buy a single NFT with PFT tokens
- **Batch Purchase** - Buy multiple NFTs in one transaction

## Notes

- All transactions are executed on Sepolia testnet
- Transaction hashes are displayed with Etherscan links
- Approvals are handled automatically when needed
- The CLI uses the same deployed contracts as the web interface

## Contract Addresses

The CLI automatically loads contract addresses from `../contracts/deployments/sepolia.json`.

## Security

- Keep your private key secure
- Only use testnet private keys for testing
