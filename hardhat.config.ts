import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/index"

const DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";

const config: HardhatUserConfig = {
  // solidity: "0.8.24",
  solidity: "0.7.6",
  networks: {
    hardhat: {
      initialDate: "0",
      allowUnlimitedContractSize: true,
      initialBaseFeePerGas: 0,
      accounts: {
        mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
      // forking: {
      //   url: "https://eth-mainnet.public.blastapi.io",
      //   blockNumber: 20266478
      // }
    },
    biteigen: {
      url: "https://rpc-testnet.biteigen.xyz",
      chainId: 1022,
      accounts: {
        mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
  etherscan: {
    apiKey: {
      biteigen: "apikey",
    },
    customChains: [
      {
        network: "biteigen",
        chainId: 1022,
        urls: {
          apiURL: "https://explorer-testnet.biteigen.xyz/api",
          browserURL: "https://explorer-testnet.biteigen.xyz/",
        }
      }
    ],
  },
};

export default config;

