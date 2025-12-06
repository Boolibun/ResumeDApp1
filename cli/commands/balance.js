import chalk from 'chalk';
import Table from 'cli-table3';
import { formatTokens } from '../utils/contracts.js';

/**
 * Display user balances (PFT tokens and NFTs)
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function displayBalance(contracts, address) {
  console.log(chalk.cyan('\n📊 Checking your balances...\n'));

  try {
    // Get PFT token balance
    const tokenBalance = await contracts.portfolioToken.balanceOf(address);

    // Get staked token balance
    const tokenStakings = await contracts.stakingManager.getTokenStakingInfo(address);
    let stakedTokens = 0n;
    for (const staking of tokenStakings) {
      stakedTokens += staking.amount;
    }

    // Get NFT balance
    const nftBalance = await contracts.portfolioNFT.balanceOf(address);

    // Get staked NFTs
    const stakedNFTs = await contracts.stakingManager.getNFTStakingInfo(address);

    // Display token balances
    const tokenTable = new Table({
      head: [chalk.yellow('Asset'), chalk.yellow('Amount'), chalk.yellow('Status')],
      colWidths: [30, 20, 20]
    });

    tokenTable.push(
      ['Portfolio Tokens (PFT)', `${formatTokens(tokenBalance)} PFT`, chalk.green('Available')],
      ['Staked Tokens', `${formatTokens(stakedTokens)} PFT`, chalk.blue('Staked')]
    );

    console.log(tokenTable.toString());

    // Display NFT balances
    const nftTable = new Table({
      head: [chalk.yellow('NFT Type'), chalk.yellow('Count'), chalk.yellow('Status')],
      colWidths: [30, 20, 20]
    });

    nftTable.push(
      ['Portfolio NFTs', nftBalance.toString(), chalk.green('Available')],
      ['Staked NFTs', stakedNFTs.length.toString(), chalk.blue('Staked')]
    );

    console.log('\n' + nftTable.toString());

    // List owned NFTs
    if (nftBalance > 0n) {
      console.log(chalk.cyan('\n🎨 Your NFTs:'));
      for (let i = 0; i < nftBalance; i++) {
        const tokenId = await contracts.portfolioNFT.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contracts.portfolioNFT.tokenURI(tokenId);
        console.log(chalk.white(`  - NFT #${tokenId}`));
      }
    }

    // List staked NFTs
    if (stakedNFTs.length > 0) {
      console.log(chalk.cyan('\n🔒 Your Staked NFTs:'));
      for (const staking of stakedNFTs) {
        const stakedAt = new Date(Number(staking.stakedAt) * 1000).toLocaleString();
        console.log(chalk.white(`  - NFT #${staking.tokenId} (Staked at: ${stakedAt})`));
      }
    }

    // Display pending rewards if staking
    if (stakedTokens > 0n || stakedNFTs.length > 0) {
      console.log(chalk.cyan('\n💰 Calculating pending rewards...'));

      if (stakedTokens > 0n) {
        const tokenRewards = await contracts.stakingManager.getTokenPendingRewards(address);
        console.log(chalk.green(`  Token Staking Rewards: ${formatTokens(tokenRewards)} PFT`));
      }

      if (stakedNFTs.length > 0) {
        const nftRewards = await contracts.stakingManager.getNFTPendingRewards(address);
        console.log(chalk.green(`  NFT Staking Rewards: ${formatTokens(nftRewards)} PFT`));
      }
    }

    console.log(chalk.gray(`\n📍 Address: ${address}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error fetching balances: ${error.message}\n`));
  }
}
