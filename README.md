# 🚀 Portfolio DApp - Blockchain Portfolio Gamifié

Une DApp qui transforme un portfolio professionnel en jeu blockchain interactif, où chaque expérience est un NFT.

## 🎯 Concept

Cette DApp gamifie l'expérience portfolio en permettant aux recruteurs de :
- **Collectionner des NFTs** représentant chaque expérience professionnelle
- **Staker leurs NFTs** pour générer des tokens de manière passive
- **Acheter de nouveaux NFTs** avec les tokens gagnés
- **Interagir avec une IA** qui révèle les détails selon les NFTs possédés. A VENIR 

## ✨ Fonctionnalités

### 🔗 Smart Contracts
- **PortfolioNFT** (ERC-721) : Représente les expériences professionnelles
- **PortfolioToken** (ERC-20) : Token de récompense pour le staking
- **StakingManager** : Gestion du staking et des récompenses
- **NFTMarketplace** : Achat de NFTs avec les tokens

### 🎮 Système de Gamification
- **NFTs uniques**
- **Staking passif** 
- **Prix progressifs**
- **Faucet pour débuter**

### 🤖 IA Évolutive A VENIR 
- **Chatbot intelligent** utilisant Claude API
- **Accès conditionnel** : Plus de NFTs = plus d'informations
- **Avatar évolutif** selon le nombre de NFTs possédés
- **Questions contextuelles** selon le niveau de déblocage

### 🎨 Interface Moderne
- **Design Matrix** avec effets glassmorphism
- **Animations fluides** avec Framer Motion
- **Responsive design** optimisé mobile
- **Thème dark** avec gradients néon

## 🛠️ Stack Technique

### Blockchain
- **Solidity 0.8.20** - Smart contracts
- **Hardhat** - Framework de développement
- **OpenZeppelin** - Standards sécurisés
- **Sepolia Testnet** - Réseau de test

### Frontend
- **React + **Vite** - Interface utilisateur
- **Wagmi** + **RainbowKit** - Intégration Web3
- **TailwindCSS** - Styling moderne
- **Framer Motion** - Animations fluides
- **Ethers.js** - Interaction blockchain

### Backend/AI
- **Claude API** (Anthropic) - Intelligence artificielle
- **Node.js** - API optionnelle pour cacher les clés

## 🚀 Installation & Lancement

### Prérequis
- Node.js
- Git
- MetaMask ou wallet compatible
- ETH Sepolia pour les tests

### 1. Installation des dépendances

```bash
# Clone le projet
git clone <your-repo>
cd portfolio-dapp

# Installation des dépendances contracts
cd contracts
npm install

# Installation des dépendances frontend
cd ../frontend
npm install
```

### 2. Configuration des variables d'environnement

```bash
# Contracts (.env)
cp contracts/.env.example contracts/.env
# Remplir avec vos clés Infura, private key, etc.

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Remplir avec les RPC URLs et adresses des contrats
```

### 3. Déploiement des contrats

```bash
cd contracts

# Compilation
npm run compile

# Tests (optionnel)
npm run test

# Déploiement local
npm run deploy

# Déploiement Sepolia (après configuration .env)
npm run deploy:sepolia
```

### 4. Mise à jour des adresses

Après déploiement, copier les adresses depuis `contracts/deployment-addresses.json` vers `frontend/.env` :

```env
VITE_PORTFOLIO_TOKEN_ADDRESS=0x...
VITE_PORTFOLIO_NFT_ADDRESS=0x...
VITE_STAKING_MANAGER_ADDRESS=0x...
VITE_NFT_MARKETPLACE_ADDRESS=0x...
```

### 5. Lancement du frontend

```bash
cd frontend
npm run dev
```

L'application sera disponible sur `http://localhost:5173`


## 🏗️ Architecture

```
portfolio-dapp/
├── contracts/                 # Smart contracts Hardhat
│   ├── contracts/
│   │   ├── PortfolioNFT.sol
│   │   ├── PortfolioToken.sol
│   │   ├── StakingManager.sol
│   │   └── NFTMarketplace.sol
│   ├── scripts/deploy.js
│   ├── test/Portfolio.test.js
│   └── hardhat.config.js
├── frontend/                  # Application React
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── contracts/        # ABIs et adresses
│   │   ├── config/          # Configuration Wagmi
│   │   └── hooks/           # Hooks personnalisés
│   ├── public/
│   └── package.json
└── cli/                      # Interface ligne de commande
    ├── commands/             # Commandes CLI
    ├── utils/               # Utilitaires
    ├── index.js             # Point d'entrée
    └── README.md            # Documentation CLI
```

## 🔧 Scripts Disponibles

### Contracts
```bash
npm run compile     # Compilation des contrats
npm run test       # Tests unitaires
npm run deploy     # Déploiement local
npm run deploy:sepolia # Déploiement Sepolia
```

### Frontend
```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Preview du build
npm run lint       # Linting ESLint
```

### CLI (Command Line Interface)
```bash
cd cli
npm install       # Installation des dépendances
npm start         # Lancement du CLI interactif
```

Le CLI permet d'interagir avec les smart contracts directement depuis le terminal :
- Vérifier les balances (tokens et NFTs)
- Claim des tokens depuis le faucet
- Staker/unstaker tokens et NFTs
- Acheter des NFTs depuis le marketplace
- Voir les récompenses de staking

Consultez `cli/README.md` pour plus de détails.

## 🌐 Déploiement Production

### Contrats
1. Configurer les variables d'environnement pour Sepolia
2. Obtenir des ETH de test : [Sepolia Faucet](https://sepoliafaucet.com/)
3. Déployer : `npm run deploy:sepolia`
4. Vérifier sur [Etherscan Sepolia](https://sepolia.etherscan.io/)

### Frontend
1. Mettre à jour les adresses des contrats
2. Build : `npm run build`
3. Déployer sur Vercel/Netlify/GitHub Pages

## 🧪 Tests A VENIR

```bash
cd contracts
npm run test
```

Les tests couvrent :
- ✅ Claim initial de NFT
- ✅ Staking et unstaking
- ✅ Calcul des récompenses
- ✅ Achat de NFTs
- ✅ Gestion des autorisations

## 🔐 Sécurité

- **ReentrancyGuard** sur toutes les fonctions sensibles
- **Ownable** pour les fonctions d'administration
- **Tests unitaires** complets
- **Vérification des balances** avant transactions
- **Gestion des erreurs** côté frontend

## 🎨 Personnalisation

### Modifier les NFTs
1. Éditer `NFT_DATA` dans `frontend/src/contracts/index.js`
2. Mettre à jour les métadonnées dans `PortfolioNFT.sol`
3. Ajuster les prix dans `NFTMarketplace.sol`

### Changer les taux de staking
Modifier les taux dans `PortfolioNFT.sol` fonction `getRarityDailyReward()`

### Personnaliser l'IA
Adapter les réponses dans `frontend/src/components/Chatbot.jsx` fonction `simulateAIResponse()`

## 🚨 Limitations Actuelles

- **Testnet uniquement** : Déployé sur Sepolia
- **IA simulée** : Réponses prédéfinies (intégration Claude à implémenter)
- **Images placeholder** : NFTs utilisent des placeholders
- **Métadonnées statiques** : Stockées on-chain (IPFS recommandé)

## 🔮 Améliorations Futures

- [ ] Intégration Claude API complète
- [ ] Images NFT personnalisées
- [ ] Métadonnées IPFS
- [ ] Système de achievements
- [ ] Notifications push
- [ ] Mobile app React Native


**🎯 Objectif :** Démontrer les compétences en développement blockchain tout en offrant une expérience unique et mémorable aux recruteurs !

*Créé avec ❤️ pour révolutionner l'expérience portfolio*