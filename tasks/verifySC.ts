import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";

const weth9Addr = "0x81850632f76E7ceeB606773c3827e351D5A8438b";
const usdtAddr = "0x0180Ae5101B36e1D29e23BF4B113225CEb650796";
const usdcAddr = "0xA48683bE1d0eccA828CabD12ff66D5Ab063705F9";

async function verifySC(_taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  try {
    await hre.run(
      'verify:verify',
      {
        address: weth9Addr,
        constructorArguments: [],
      },
    );
  } catch (error) {
    console.log("Cannot verify contract: ", error)
  }

  try {
    await hre.run(
      'verify:verify',
      {
        address: usdtAddr,
        constructorArguments: [],
        contract: "contracts/Tether.sol:Tether"
      },
    );
  } catch (error) {
    console.log("Cannot verify contract: ", error)
  }

  try {
    await hre.run(
      'verify:verify',
      {
        address: usdcAddr,
        constructorArguments: [],
        contract: "contracts/USDCoin.sol:USDCoin"
      },
    );
  } catch (error) {
    console.log("Cannot verify weth9 contract: ", error)
  }
}

task("verifySC", "verify smart contracts")
  .setAction(verifySC);
