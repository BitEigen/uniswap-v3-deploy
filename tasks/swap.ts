import { FeeAmount } from "@uniswap/v3-sdk";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import BitEigen from '../biteigen.json';
import { SwapRouter__factory } from "../typechain-types";
import { ISwapRouter, SwapRouter } from "../typechain-types/v3-periphery/artifacts/contracts/SwapRouter";

const usdcAddress = '0xA48683bE1d0eccA828CabD12ff66D5Ab063705F9';
const tetherAddress = '0x0180Ae5101B36e1D29e23BF4B113225CEb650796';
const swapRouter03 = BitEigen.swapRouter03;

async function swapTask(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  const usdcContract = await ethers.getContractAt("USDCoin", usdcAddress);
  const usdtContract = await ethers.getContractAt("Tether", tetherAddress);

  const swapRouter = SwapRouter__factory.connect(swapRouter03 ?? '', signer);

  const tx = await usdcContract.approve(swapRouter03 ?? '', ethers.parseEther("100"));
  await tx.wait();
  const tx2 = await usdtContract.approve(swapRouter03 ?? '', ethers.parseEther("100"));
  await tx2.wait();
  let round = 1;

  while (true) {
    try {
      console.log("round: ", round)
      console.log(`swap usdc -> usdt`)
      await swap(hre, swapRouter, usdcContract, usdtContract);
      console.log(`swap usdt -> usdc`)
      await swap(hre, swapRouter, tetherAddress, usdcAddress);
    } catch (e) {
      console.log("Error while swapping: ", e)
    } finally {
      // wait 10s
      console.log("Wait 30s...")
      round++;
      await new Promise(resolve => setTimeout(resolve, 30000))
    }
  }
}

async function swap(hre: HardhatRuntimeEnvironment, swapRouter: SwapRouter, tokenIn: string, tokenOut: string) {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();

  const params: ISwapRouter.ExactInputSingleParamsStruct = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: FeeAmount.LOWEST,
    recipient: await signer.getAddress(),
    deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    amountIn: ethers.parseEther("0.01"),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  };

  const tx = await swapRouter.exactInputSingle(params);
  await tx.wait();
}


task("swap", "deploy usdt, usdc")
  .setAction(swapTask);
