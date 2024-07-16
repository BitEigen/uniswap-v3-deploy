import { task } from "hardhat/config";
import deploy from "../src/deploy";
import { MigrationState } from "../src/migrations";
import { asciiStringToBytes32 } from "../src/util/asciiStringToBytes32";
import fs from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deployUniswap(taskArgs: { weth9: string },
  hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const weth9Address = ethers.getAddress(taskArgs.weth9)
  const [signer] = await ethers.getSigners();

  let state: MigrationState = {};

  let finalState: MigrationState
  const onStateChange = async (newState: MigrationState): Promise<void> => {
    fs.writeFileSync("state.json", JSON.stringify(newState))
    finalState = newState
  }
  let step = 1
  const gasPrice = ethers.parseUnits("0.01", "gwei")
  const nativeCurrencyLabelBytes = asciiStringToBytes32("ETH");
  const v2CoreFactoryAddress = ethers.ZeroAddress;
  const ownerAddress = await signer.getAddress();

  const results = []
  const generator = deploy({
    signer: signer,
    gasPrice,
    nativeCurrencyLabelBytes,
    v2CoreFactoryAddress,
    ownerAddress,
    weth9Address,
    initialState: state,
    onStateChange,
  })

  for await (const result of generator) {
    console.log(`Step ${step++} complete`, result)
    results.push(result)
  }

  return results
};

task("deploy-uniswap", "Deploys Uniswap V3 contracts")
  .addParam<string>("weth9", "weth9 address")
  .setAction(deployUniswap);
