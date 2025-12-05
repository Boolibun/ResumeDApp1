#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Mise à jour du frontend avec les adresses des contrats...\n');

// Read deployment addresses
const deploymentPath = path.join(__dirname, '../contracts/deployment-addresses.json');
const frontendEnvPath = path.join(__dirname, '../frontend/.env');

if (!fs.existsSync(deploymentPath)) {
  console.error('❌ Fichier deployment-addresses.json introuvable!');
  console.error('Vous devez d\'abord déployer les contrats avec: npm run deploy:sepolia');
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Read existing frontend .env or create new one
let envContent = '';
if (fs.existsSync(frontendEnvPath)) {
  envContent = fs.readFileSync(frontendEnvPath, 'utf8');
}

// Update or add contract addresses
const updateOrAdd = (content, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
};

// Add/update contract addresses
envContent = updateOrAdd(envContent, 'VITE_PORTFOLIO_TOKEN_ADDRESS', deployment.PortfolioToken);
envContent = updateOrAdd(envContent, 'VITE_PORTFOLIO_NFT_ADDRESS', deployment.PortfolioNFT);
envContent = updateOrAdd(envContent, 'VITE_STAKING_MANAGER_ADDRESS', deployment.StakingManager);
envContent = updateOrAdd(envContent, 'VITE_NFT_MARKETPLACE_ADDRESS', deployment.NFTMarketplace);

// Add network info if not exists
if (!envContent.includes('VITE_CHAIN_ID')) {
  envContent = updateOrAdd(envContent, 'VITE_CHAIN_ID', '11155111');
}
if (!envContent.includes('VITE_SEPOLIA_RPC_URL') || envContent.includes('VITE_SEPOLIA_RPC_URL=""')) {
  envContent = updateOrAdd(envContent, 'VITE_SEPOLIA_RPC_URL', 'https://sepolia.infura.io/v3/demo');
}

// Write updated .env
fs.writeFileSync(frontendEnvPath, envContent.trim() + '\n');

console.log('✅ Frontend .env mis à jour avec les adresses des contrats:');
console.log('📋 Adresses ajoutées:');
console.log(`   VITE_PORTFOLIO_TOKEN_ADDRESS=${deployment.PortfolioToken}`);
console.log(`   VITE_PORTFOLIO_NFT_ADDRESS=${deployment.PortfolioNFT}`);
console.log(`   VITE_STAKING_MANAGER_ADDRESS=${deployment.StakingManager}`);
console.log(`   VITE_NFT_MARKETPLACE_ADDRESS=${deployment.NFTMarketplace}`);

console.log('\n🔗 Liens Etherscan Sepolia:');
console.log(`   Token: https://sepolia.etherscan.io/address/${deployment.PortfolioToken}`);
console.log(`   NFT: https://sepolia.etherscan.io/address/${deployment.PortfolioNFT}`);

console.log('\n🚀 Prochaines étapes:');
console.log('1. cd frontend');
console.log('2. npm run dev');
console.log('3. Connectez MetaMask sur Sepolia');
console.log('4. Testez le mint gratuit de 100 PFT!');

console.log('\n🎉 Votre Portfolio DApp est prête à être testée!');