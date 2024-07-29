import SwapRouter03 from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import { ContractFactory } from 'ethers';
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import Biteigen from '../biteigen.json';

const weth9Addr = "0x81850632f76E7ceeB606773c3827e351D5A8438b";

async function deploySwapRouter3(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.ethers.getSigners();
  const factory = new ContractFactory(SwapRouter03.abi, SwapRouter03.bytecode, signer);
  const contract = await factory.deploy(Biteigen.v3CoreFactoryAddress, weth9Addr);
  console.log(`SwapRouter3 deployed at ${contract.target}`);
}

task("deploySwapRouter3", "deploy swap router 3")
  .setAction(deploySwapRouter3);

