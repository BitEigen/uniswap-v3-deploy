import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";

async function verifySC(taskArgs: { weth9: string }, hre: HardhatRuntimeEnvironment) {
  // verify WETH9
  if (taskArgs.weth9) {
    try {
      await hre.run(
        'verify:verify',
        {
          address: taskArgs.weth9,
          constructorArguments: [],
        },
      );
    } catch (error) {
      console.log("Cannot verify weth9 contract: ", error)
    }
  }
}

task("verifySC", "verify smart contracts")
  .addOptionalParam("weth9", "weth9 contract address")
  .setAction(verifySC);
