const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env
require('dotenv').config();

// Configuration Pinata - tu dois avoir ces variables dans ton .env
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.log('❌ Erreur: PINATA_API_KEY et PINATA_SECRET_KEY doivent être définis dans .env');
  console.log('📝 Va sur https://app.pinata.cloud pour obtenir tes clés API');
  process.exit(1);
}

async function uploadFileToIPFS(filePath, fileName) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'NFT Metadata',
        collection: 'Portfolio NFT'
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Erreur upload ${fileName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function uploadAllMetadata() {
  console.log('🚀 Upload des metadata NFT vers IPFS...\n');
  
  const metadataDir = path.join(__dirname, '..', 'metadata');
  const results = {};
  
  // Upload chaque fichier JSON (NFTs 1-3 only)
  for (let i = 1; i <= 3; i++) {
    const fileName = `${i}.json`;
    const filePath = path.join(metadataDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Fichier ${fileName} non trouvé`);
      continue;
    }
    
    try {
      console.log(`📤 Upload de ${fileName}...`);
      const result = await uploadFileToIPFS(filePath, `Portfolio NFT #${i} Metadata`);
      results[i] = result.IpfsHash;
      console.log(`✅ ${fileName} uploadé: ${result.IpfsHash}`);
      console.log(`🔗 URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}\n`);
      
      // Petit délai pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Erreur upload ${fileName}`);
    }
  }
  
  // Sauvegarde des résultats
  const resultPath = path.join(__dirname, 'metadata-ipfs-hashes.json');
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
  
  console.log('📝 Résultats sauvegardés dans metadata-ipfs-hashes.json');
  console.log('\n🎯 Hashes IPFS des metadata:');
  console.log('=====================================');
  for (const [id, hash] of Object.entries(results)) {
    console.log(`NFT #${id}: ${hash}`);
  }
  console.log('=====================================');
  
  console.log('\n🔧 URLs pour tests:');
  for (const [id, hash] of Object.entries(results)) {
    console.log(`NFT #${id}: https://gateway.pinata.cloud/ipfs/${hash}`);
  }
  
  return results;
}

// Test de connexion Pinata
async function testPinataConnection() {
  try {
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    });
    console.log('✅ Connexion Pinata réussie:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Erreur connexion Pinata:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 Test de connexion Pinata...');
  const connected = await testPinataConnection();
  
  if (!connected) {
    console.log('\n💡 Pour résoudre:');
    console.log('1. Va sur https://app.pinata.cloud/keys');
    console.log('2. Crée une nouvelle API Key');
    console.log('3. Ajoute PINATA_API_KEY et PINATA_SECRET_KEY dans ton fichier .env');
    return;
  }
  
  console.log('\n');
  await uploadAllMetadata();
  
  console.log('\n✅ Upload terminé!');
  console.log('🎉 Tu peux maintenant mettre à jour le contrat PortfolioNFT avec ces URLs IPFS');
}

main().catch(console.error);