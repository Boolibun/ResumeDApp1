import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { formatTokens, parseTokens } from '../utils/contracts.js';

/**
 * Stake tokens
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function stakeTokens(contracts, address) {
  console.log(chalk.cyan('\n🔒 Stake Portfolio Tokens\n'));

  try {
    // Get current balance
    const balance = await contracts.portfolioToken.balanceOf(address);
    console.log(chalk.white(`Available balance: ${formatTokens(balance)} PFT\n`));

    if (balance === 0n) {
      console.log(chalk.yellow('You have no tokens to stake.\n'));
      return;
    }

    // Ask for amount
    const { amount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Enter amount to stake (PFT):',
        validate: (input) => {
          try {
            const value = parseTokens(input);
            if (value <= 0n) return 'Amount must be greater than 0';
            if (value > balance) return 'Insufficient balance';
            return true;
          } catch {
            return 'Invalid amount';
          }
        }
      }
    ]);

    const amountWei = parseTokens(amount);

    // Check allowance
    const allowance = await contracts.portfolioToken.allowance(address, await contracts.stakingManager.getAddress());

    if (allowance < amountWei) {
      const spinner = ora('Approving tokens...').start();
      const approveTx = await contracts.portfolioToken.approve(await contracts.stakingManager.getAddress(), amountWei);
      await approveTx.wait();
      spinner.succeed('Tokens approved');
    }

    // Stake tokens
    const spinner = ora('Staking tokens...').start();
    const tx = await contracts.stakingManager.stakeTokens(amountWei);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully staked ${amount} PFT!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error staking tokens: ${error.message}\n`));
  }
}

/**
 * Unstake tokens
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function unstakeTokens(contracts, address) {
  console.log(chalk.cyan('\n🔓 Unstake Portfolio Tokens\n'));

  try {
    // Get all token stakings
    const tokenStakings = await contracts.stakingManager.getTokenStakingInfo(address);

    if (tokenStakings.length === 0) {
      console.log(chalk.yellow('You have no staked tokens.\n'));
      return;
    }

    // Calculate total staked
    let totalStaked = 0n;
    for (const staking of tokenStakings) {
      totalStaked += staking.amount;
    }

    console.log(chalk.white(`Total staked: ${formatTokens(totalStaked)} PFT`));
    console.log(chalk.white(`Number of staking positions: ${tokenStakings.length}\n`));

    // List staking positions
    const choices = tokenStakings.map((staking, index) => ({
      name: `Position ${index}: ${formatTokens(staking.amount)} PFT (Staked at: ${new Date(Number(staking.stakedAt) * 1000).toLocaleString()})`,
      value: index
    }));

    // Ask which position to unstake
    const { stakingIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stakingIndex',
        message: 'Select staking position to unstake:',
        choices: choices
      }
    ]);

    // Unstake tokens
    const spinner = ora('Unstaking tokens...').start();
    const tx = await contracts.stakingManager.unstakeTokens(stakingIndex);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully unstaked ${formatTokens(tokenStakings[stakingIndex].amount)} PFT!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error unstaking tokens: ${error.message}\n`));
  }
}

/**
 * Stake NFT
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function stakeNFT(contracts, address) {
  console.log(chalk.cyan('\n🔒 Stake Portfolio NFT\n'));

  try {
    // Get owned NFTs
    const nftBalance = await contracts.portfolioNFT.balanceOf(address);

    if (nftBalance === 0n) {
      console.log(chalk.yellow('You have no NFTs to stake.\n'));
      return;
    }

    // List available NFTs
    const nftIds = [];
    for (let i = 0; i < nftBalance; i++) {
      const tokenId = await contracts.portfolioNFT.tokenOfOwnerByIndex(address, i);
      nftIds.push(tokenId.toString());
    }

    console.log(chalk.white(`Available NFTs: ${nftIds.join(', ')}\n`));

    // Ask for NFT ID
    const { tokenId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tokenId',
        message: 'Select NFT to stake:',
        choices: nftIds
      }
    ]);

    // Check approval
    const isApproved = await contracts.portfolioNFT.isApprovedForAll(address, await contracts.stakingManager.getAddress());

    if (!isApproved) {
      const spinner = ora('Approving NFT...').start();
      const approveTx = await contracts.portfolioNFT.setApprovalForAll(await contracts.stakingManager.getAddress(), true);
      await approveTx.wait();
      spinner.succeed('NFT approved');
    }

    // Stake NFT
    const spinner = ora('Staking NFT...').start();
    const tx = await contracts.stakingManager.stakeNFT(tokenId);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully staked NFT #${tokenId}!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error staking NFT: ${error.message}\n`));
  }
}

/**
 * Unstake NFT
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function unstakeNFT(contracts, address) {
  console.log(chalk.cyan('\n🔓 Unstake Portfolio NFT\n'));

  try {
    // Get staked NFTs
    const stakedNFTs = await contracts.stakingManager.getNFTStakingInfo(address);

    if (stakedNFTs.length === 0) {
      console.log(chalk.yellow('You have no staked NFTs.\n'));
      return;
    }

    // List staked NFTs
    const nftChoices = stakedNFTs.map(nft => ({
      name: `NFT #${nft.tokenId} (Staked at: ${new Date(Number(nft.stakedAt) * 1000).toLocaleString()})`,
      value: nft.tokenId.toString()
    }));

    // Ask for NFT ID
    const { tokenId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tokenId',
        message: 'Select NFT to unstake:',
        choices: nftChoices
      }
    ]);

    // Unstake NFT
    const spinner = ora('Unstaking NFT...').start();
    const tx = await contracts.stakingManager.unstakeNFT(tokenId);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully unstaked NFT #${tokenId}!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error unstaking NFT: ${error.message}\n`));
  }
}

/**
 * Claim staking rewards
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function claimRewards(contracts, address) {
  console.log(chalk.cyan('\n💰 Claim Staking Rewards\n'));

  try {
    // Calculate total rewards
    const tokenRewards = await contracts.stakingManager.getTokenPendingRewards(address);
    const nftRewards = await contracts.stakingManager.getNFTPendingRewards(address);
    const totalRewards = tokenRewards + nftRewards;

    if (totalRewards === 0n) {
      console.log(chalk.yellow('No rewards to claim.\n'));
      return;
    }

    console.log(chalk.green(`Pending rewards: ${formatTokens(totalRewards)} PFT\n`));
    console.log(chalk.white(`  - Token Staking: ${formatTokens(tokenRewards)} PFT`));
    console.log(chalk.white(`  - NFT Staking: ${formatTokens(nftRewards)} PFT\n`));

    // Claim rewards
    const spinner = ora('Claiming rewards...').start();
    const tx = await contracts.stakingManager.claimAllRewards();
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully claimed ${formatTokens(totalRewards)} PFT!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error claiming rewards: ${error.message}\n`));
  }
}
