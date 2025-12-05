#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuration Portfolio DApp pour Sepolia\n');
console.log('Ce script va vous aider à configurer les variables d\'environnement\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setup() {
  console.log('📍 Étape 1: Configuration RPC Sepolia');
  console.log('Vous pouvez obtenir une URL gratuite sur:');
  console.log('- Infura: https://infura.io/');
  console.log('- Alchemy: https://www.alchemy.com/\n');
  
  const rpcUrl = await askQuestion('URL RPC Sepolia: ');
  
  console.log('\n🔐 Étape 2: Clé privée du wallet');
  console.log('⚠️  ATTENTION: Cette clé doit avoir du ETH Sepolia pour les frais de gas');
  console.log('💰 Faucet Sepolia: https://sepoliafaucet.com/\n');
  
  const privateKey = await askQuestion('Clé privée (sans 0x): ');
  
  console.log('\n🔍 Étape 3: Etherscan API Key (optionnel)');
  console.log('Pour vérifier automatiquement vos contrats sur Etherscan');
  console.log('Créer une clé gratuite: https://etherscan.io/apis\n');
  
  const etherscanKey = await askQuestion('Etherscan API Key (optionnel): ');
  
  // Créer le fichier .env pour les contrats
  const contractsEnv = `# Configuration Portfolio DApp Sepolia
SEPOLIA_URL=${rpcUrl}
PRIVATE_KEY=${privateKey}
ETHERSCAN_API_KEY=${etherscanKey}

# Adresses des contrats (seront remplies après déploiement)
PORTFOLIO_TOKEN_ADDRESS=
PORTFOLIO_NFT_ADDRESS=
STAKING_MANAGER_ADDRESS=
NFT_MARKETPLACE_ADDRESS=
`;

  fs.writeFileSync(path.join(__dirname, '../contracts/.env'), contractsEnv);
  
  console.log('\n✅ Configuration sauvegardée!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. cd contracts');
  console.log('2. npm run deploy:sepolia');
  console.log('3. Copier les adresses vers frontend/.env');
  console.log('\n🔥 Votre Portfolio DApp sera bientôt live sur Sepolia!');
  
  rl.close();
}

if (require.main === module) {
  setup().catch(console.error);
}