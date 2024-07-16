import { FeeAmount, nearestUsableTick } from '@uniswap/v3-sdk';
import bn from 'bignumber.js';
import { expect } from 'chai';
import { BigNumberish, Signer } from 'ethers';
import hre, { ethers } from 'hardhat';
import deploy, { deployWETH9 } from '../src/deploy';
import { MigrationState, StepOutput } from '../src/migrations';
import { asciiStringToBytes32 } from '../src/util/asciiStringToBytes32';
import { UniswapV3Factory__factory, UniswapV3Pool__factory } from '../typechain-types/factories/v3-core/artifacts/contracts';
import { NonfungiblePositionManager__factory, SwapRouter__factory } from '../typechain-types/factories/v3-periphery/artifacts/contracts';
import { UniswapV3Pool } from '../typechain-types/v3-core/artifacts/contracts';
import { INonfungiblePositionManager } from '../typechain-types/v3-periphery/artifacts/contracts/NonfungiblePositionManager';
import { ISwapRouter } from '../typechain-types/v3-periphery/artifacts/contracts/SwapRouter';
import { token } from '../typechain-types/@openzeppelin/contracts';

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

describe('Test uniswap functions', () => {
  let signer: Signer;
  let signer1: Signer;
  let signer2: Signer;
  let weth9Address: string;
  let tetherAddress: string;
  let usdcAddress: string;
  let finalState: MigrationState;
  let poolAddr: string;

  before('Check signer', async () => {
    [signer, signer1, signer2] = await ethers.getSigners();
  });

  it('Deploy Tokens', async () => {
    expect(signer).to.not.be.undefined;
    // deploy Tether
    const tetherFactory = await hre.ethers.getContractFactory("Tether");
    const tether = await tetherFactory.deploy();
    tetherAddress = await tether.getAddress();
    tether.mint(signer.getAddress(), ethers.parseEther("10000"));
    tether.mint(signer1.getAddress(), ethers.parseEther("10000"));
    tether.mint(signer2.getAddress(), ethers.parseEther("10000"));

    // deploy USDC
    const usdcFactory = await hre.ethers.getContractFactory("USDCoin");
    const usdc = await usdcFactory.deploy();
    usdcAddress = await usdc.getAddress();
    usdc.mint(signer.getAddress(), ethers.parseEther("10000"));
    usdc.mint(signer1.getAddress(), ethers.parseEther("10000"));

    // deploy WETH
    const weth9Artifac = await hre.artifacts.readArtifact("WETH9")
    const weth9 = await deployWETH9(weth9Artifac, signer);
    weth9Address = await weth9.getAddress()
  })

  it('Deploy Uniswap V3 core contracts', async () => {
    expect(weth9Address).to.not.be.undefined;

    const results: StepOutput[][] = [];
    // deploy uniswap v3 core contracts
    let state: MigrationState = {};

    const onStateChange = async (newState: MigrationState): Promise<void> => {
      finalState = newState
    }
    const gasPrice = ethers.parseUnits("0.01", "gwei")
    const nativeCurrencyLabelBytes = asciiStringToBytes32("WETH");
    const v2CoreFactoryAddress = ethers.ZeroAddress;
    const ownerAddress = await signer.getAddress();

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
      results.push(result)
    }
  });

  it('Deploy a pool', async () => {
    expect(finalState.nonfungibleTokenPositionManagerAddress).to.not.be.undefined
    expect(usdcAddress).to.not.be.undefined;
    expect(tetherAddress).to.not.be.undefined;
    expect(finalState.v3CoreFactoryAddress).to.not.be.undefined;

    const token0 = tetherAddress;
    const token1 = usdcAddress;
    const fee = FeeAmount.LOW;
    const price = encodePriceSqrt(1, 1);

    const uniswapFactory = UniswapV3Factory__factory.connect(finalState.v3CoreFactoryAddress ?? '', signer);
    const nonfungibleTokenPositionManager = NonfungiblePositionManager__factory.connect(finalState.nonfungibleTokenPositionManagerAddress ?? '', signer);

    await nonfungibleTokenPositionManager.createAndInitializePoolIfNecessary(token0, token1, fee, price, { gasLimit: 5000000 });
    poolAddr = await uniswapFactory.getPool(token0, token1, fee);
  });

  // signer1 will add liquidity to the pool
  it('Add liquidity to the pool', async () => {
    expect(poolAddr).to.not.be.undefined

    const poolContract = UniswapV3Pool__factory.connect(poolAddr, signer);
    const nftPositionManager = NonfungiblePositionManager__factory.connect(finalState.nonfungibleTokenPositionManagerAddress ?? '', signer);
    const usdtContract = await ethers.getContractAt("Tether", tetherAddress);
    const usdcContract = await ethers.getContractAt("USDCoin", usdcAddress);

    await usdtContract.connect(signer1).approve(finalState.nonfungibleTokenPositionManagerAddress ?? '', ethers.parseEther("1000"));
    await usdcContract.connect(signer1).approve(finalState.nonfungibleTokenPositionManagerAddress ?? '', ethers.parseEther("1000"));

    const poolData = await getPoolData(poolContract);
    console.log("pool data before add liquidity: ", poolData);

    const tickLower = nearestUsableTick(Number(poolData.tick), Number(poolData.tickSpacing)) - Number(poolData.tickSpacing) * 2;
    const tickUpper = nearestUsableTick(Number(poolData.tick), Number(poolData.tickSpacing)) + Number(poolData.tickSpacing) * 2;

    const params: INonfungiblePositionManager.MintParamsStruct = {
      token0: tetherAddress,
      token1: usdcAddress,
      fee: poolData.fee,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: ethers.parseEther("100"),
      amount1Desired: ethers.parseEther("100"),
      amount0Min: 0,
      amount1Min: 0,
      recipient: await signer1.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }

    const tx = await nftPositionManager.connect(signer1).mint(params, { gasLimit: 1000000 });
    await tx.wait();

    const newPoolData = await getPoolData(poolContract);
    console.log("pool data before add liquidity: ", newPoolData);
  });

  // this test is not working yet
  // it('Swap usdt for usdc', async () => {
  //   expect(finalState.v3CoreFactoryAddress).to.not.be.undefined
  //   expect(finalState.swapRouter02).to.not.be.undefined
  //
  //   const tetherContract = await ethers.getContractAt("Tether", tetherAddress);
  //   const usdcContract = await ethers.getContractAt("USDCoin", usdcAddress);
  //   const uniswapFactory = UniswapV3Factory__factory.connect(finalState.v3CoreFactoryAddress ?? '', signer);
  //   const swapRouter = SwapRouter__factory.connect(finalState.swapRouter02 ?? '', signer);
  //
  //   await tetherContract.connect(signer2).approve(finalState.swapRouter02 ?? '', ethers.parseEther("100"));
  //
  //   const tokenIn = tetherAddress;
  //   const tokenOut = usdcAddress;
  //   const poolAddress = await uniswapFactory.getPool(tokenIn, tokenOut, FeeAmount.LOW);
  //   const poolContract = UniswapV3Pool__factory.connect(poolAddress, signer);
  //
  //   const params: ISwapRouter.ExactInputSingleParamsStruct = {
  //     tokenIn: tokenIn,
  //     tokenOut: tokenOut,
  //     fee: FeeAmount.LOW,
  //     recipient: await signer.getAddress(),
  //     deadline: Math.floor(Date.now() / 1000) + (60 * 10),
  //     amountIn: ethers.parseEther("1"),
  //     amountOutMinimum: 0,
  //     sqrtPriceLimitX96: 0
  //   };
  //
  //   const tx = await swapRouter.connect(signer2).exactInputSingle(params, { gasLimit: 1000000 });
  //   await tx.wait();
  //
  // });
})

function encodePriceSqrt(reserve1: BigNumberish, reserve0: BigNumberish) {
  return new bn(reserve1.toString())
    .div(reserve0.toString())
    .sqrt()
    .multipliedBy(new bn(2).pow(96))
    .integerValue(3)
    .toString()
}

async function getPoolData(poolContract: UniswapV3Pool) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}
