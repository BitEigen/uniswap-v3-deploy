import { task } from "hardhat/config";
import deploy from "../src/deploy";
import { MigrationState } from "../src/migrations";
import { asciiStringToBytes32 } from "../src/util/asciiStringToBytes32";
import fs from "fs";


task("deploy-uniswap", "Deploys Uniswap V3 contracts", async (args, hre) => {
  const { ethers } = hre;
  const weth9Address = ethers.ZeroAddress;
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
  const confirmations = 2;

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

    // wait 15 minutes for any transactions sent in the step
    await Promise.all(
      result.map(
        (stepResult) => {
          if (stepResult.hash) {
            // return wallet.provider.waitForTransaction(stepResult.hash, confirmations, /* 15 minutes */ 1000 * 60 * 15)
          } else {
            return Promise.resolve(true)
          }
        }
      )
    )
  }

  return results

});
