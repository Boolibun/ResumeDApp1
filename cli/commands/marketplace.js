import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatTokens } from '../utils/contracts.js';

/**
 * Display available NFTs in marketplace
 * @param {Object} contracts - Contract instances
 */
export async function viewMarketplace(contracts) {
  console.log(chalk.cyan('\n🏪 NFT Marketplace\n'));

  try {
    // NFT metadata
    const nfts = [
      { id: 1, name: 'IT Support Technician', rarity: 'Common', price: '100' },
      { id: 2, name: 'Junior Software Developer', rarity: 'Rare', price: '250' },
      { id: 3, name: 'Blockchain Developer', rarity: 'Epic', price: '500' }
    ];

    const table = new Table({
      head: [
        chalk.yellow('ID'),
        chalk.yellow('Name'),
        chalk.yellow('Rarity'),
        chalk.yellow('Price (PFT)'),
        chalk.yellow('Status')
      ],
      colWidths: [6, 35, 15, 15, 15]
    });

    for (const nft of nfts) {
      try {
        const price = await contracts.nftMarketplace.nftPrices(nft.id);
        const totalSupply = await contracts.nftMarketplace.totalSupply(nft.id);
        const maxSupply = await contracts.nftMarketplace.maxSupply(nft.id);
        const available = maxSupply - totalSupply;

        const rarityColor =
          nft.rarity === 'Common' ? chalk.gray :
          nft.rarity === 'Rare' ? chalk.blue :
          chalk.magenta;

        const status = available > 0n ? chalk.green(`${available} available`) : chalk.red('Sold out');

        table.push([
          nft.id,
          nft.name,
          rarityColor(nft.rarity),
          formatTokens(price),
          status
        ]);
      } catch (error) {
        // NFT might not exist yet
        table.push([
          nft.id,
          nft.name,
          chalk.gray(nft.rarity),
          nft.price,
          chalk.gray('Not listed')
        ]);
      }
    }

    console.log(table.toString());
    console.log('');

  } catch (error) {
    console.log(chalk.red(`\n❌ Error fetching marketplace data: ${error.message}\n`));
  }
}

/**
 * Purchase NFT from marketplace
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function purchaseNFT(contracts, address) {
  console.log(chalk.cyan('\n🛒 Purchase NFT\n'));

  try {
    // Show marketplace first
    await viewMarketplace(contracts);

    // Get user's token balance
    const balance = await contracts.portfolioToken.balanceOf(address);
    console.log(chalk.white(`Your balance: ${formatTokens(balance)} PFT\n`));

    // Ask which NFT to buy
    const { tokenId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tokenId',
        message: 'Select NFT to purchase:',
        choices: [
          { name: 'NFT #1 - IT Support Technician (Common)', value: '1' },
          { name: 'NFT #2 - Junior Software Developer (Rare)', value: '2' },
          { name: 'NFT #3 - Blockchain Developer (Epic)', value: '3' }
        ]
      }
    ]);

    // Get NFT price
    const price = await contracts.nftMarketplace.nftPrices(tokenId);

    console.log(chalk.white(`\nPrice: ${formatTokens(price)} PFT`));

    if (balance < price) {
      console.log(chalk.red('\n❌ Insufficient balance to purchase this NFT.\n'));
      return;
    }

    // Confirm purchase
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm purchase of NFT #${tokenId} for ${formatTokens(price)} PFT?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nPurchase cancelled.\n'));
      return;
    }

    // Check allowance
    const allowance = await contracts.portfolioToken.allowance(address, await contracts.nftMarketplace.getAddress());

    if (allowance < price) {
      const spinner = ora('Approving tokens...').start();
      const approveTx = await contracts.portfolioToken.approve(await contracts.nftMarketplace.getAddress(), price);
      await approveTx.wait();
      spinner.succeed('Tokens approved');
    }

    // Purchase NFT
    const spinner = ora('Purchasing NFT...').start();
    const tx = await contracts.nftMarketplace.purchaseNFT(tokenId);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully purchased NFT #${tokenId}!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

    // Show updated balance
    const newBalance = await contracts.portfolioToken.balanceOf(address);
    console.log(chalk.cyan(`💰 New balance: ${formatTokens(newBalance)} PFT\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error purchasing NFT: ${error.message}\n`));
    if (error.reason) {
      console.log(chalk.yellow(`Reason: ${error.reason}\n`));
    }
  }
}

/**
 * Batch purchase NFTs
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function batchPurchaseNFTs(contracts, address) {
  console.log(chalk.cyan('\n🛒 Batch Purchase NFTs\n'));

  try {
    // Show marketplace first
    await viewMarketplace(contracts);

    // Get user's token balance
    const balance = await contracts.portfolioToken.balanceOf(address);
    console.log(chalk.white(`Your balance: ${formatTokens(balance)} PFT\n`));

    // Ask which NFTs to buy
    const { tokenIds } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tokenIds',
        message: 'Select NFTs to purchase (use spacebar to select):',
        choices: [
          { name: 'NFT #1 - IT Support Technician', value: '1' },
          { name: 'NFT #2 - Junior Software Developer', value: '2' },
          { name: 'NFT #3 - Blockchain Developer', value: '3' }
        ],
        validate: (answer) => {
          if (answer.length === 0) {
            return 'You must select at least one NFT';
          }
          return true;
        }
      }
    ]);

    // Calculate total price
    let totalPrice = 0n;
    for (const id of tokenIds) {
      const price = await contracts.nftMarketplace.nftPrices(id);
      totalPrice += price;
    }

    console.log(chalk.white(`\nTotal price: ${formatTokens(totalPrice)} PFT`));

    if (balance < totalPrice) {
      console.log(chalk.red('\n❌ Insufficient balance to purchase these NFTs.\n'));
      return;
    }

    // Confirm purchase
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm batch purchase for ${formatTokens(totalPrice)} PFT?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nPurchase cancelled.\n'));
      return;
    }

    // Check allowance
    const allowance = await contracts.portfolioToken.allowance(address, await contracts.nftMarketplace.getAddress());

    if (allowance < totalPrice) {
      const spinner = ora('Approving tokens...').start();
      const approveTx = await contracts.portfolioToken.approve(await contracts.nftMarketplace.getAddress(), totalPrice);
      await approveTx.wait();
      spinner.succeed('Tokens approved');
    }

    // Batch purchase
    const spinner = ora('Purchasing NFTs...').start();
    const tx = await contracts.nftMarketplace.batchPurchaseNFTs(tokenIds);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully purchased ${tokenIds.length} NFTs!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error batch purchasing NFTs: ${error.message}\n`));
    if (error.reason) {
      console.log(chalk.yellow(`Reason: ${error.reason}\n`));
    }
  }
}
