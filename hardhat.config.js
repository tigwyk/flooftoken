const { defaultAccounts } = require("@ethereum-waffle/provider");

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
  // accountsBalance: "990000000000000000000",
}


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: accounts
    },
    localhost: {
      live: false,
      saveDeployments: true,
      tags: ["local"],
    },
    hardhat: {
      forking: {
        enabled: process.env.FORKING === "true",
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      },
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: accounts,
      chainId: 97,
      tags: ["staging"],
      gasMultiplier: 2,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

