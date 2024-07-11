import { ContractFactory, InterfaceAbi } from 'ethers'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'
import linkLibraries from '../../util/linkLibraries'

type ConstructorArgs = (string | number | string[] | number[])[]

export default function createDeployContractStep({
  key,
  artifact: { contractName, abi, bytecode, linkReferences },
  computeLibraries,
  computeArguments,
}: {
  key: keyof MigrationState
  artifact: {
    contractName: string
    abi: InterfaceAbi
    bytecode: string
    linkReferences?: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  }
  computeLibraries?: (state: Readonly<MigrationState>, config: MigrationConfig) => { [libraryName: string]: string }
  computeArguments?: (state: Readonly<MigrationState>, config: MigrationConfig) => ConstructorArgs
}): MigrationStep {
  if (linkReferences && Object.keys(linkReferences).length > 0 && !computeLibraries) {
    throw new Error('Missing function to compute library addresses')
  } else if (computeLibraries && (!linkReferences || Object.keys(linkReferences).length === 0)) {
    throw new Error('Compute libraries passed but no link references')
  }

  return async (state, config) => {
    if (state[key] === undefined) {
      const constructorArgs: ConstructorArgs = computeArguments ? computeArguments(state, config) : []

      const factory = new ContractFactory(
        abi,
        linkReferences && computeLibraries
          ? linkLibraries({ bytecode, linkReferences }, computeLibraries(state, config))
          : bytecode,
        config.signer
      )

      // const factory = await ethers.getContractFactory(
      //   abi as any,
      //   linkReferences && computeLibraries
      //     ? linkLibraries({ bytecode, linkReferences }, computeLibraries(state, config))
      //     : bytecode,
      //   config.signer
      // )

      let contract
      try {
        contract = await factory.deploy(...constructorArgs, { gasPrice: config.gasPrice })
      } catch (error) {
        console.error(`Failed to deploy ${contractName}`)
        throw error
      }

      const tx = await contract.waitForDeployment();
      const contractAddr = await contract.getAddress();

      state[key] = contractAddr

      return [
        {
          message: `Contract ${contractName} deployed`,
          address: contractAddr,
          hash: tx.deploymentTransaction()?.hash
        },
      ]
    } else {
      return [{ message: `Contract ${contractName} was already deployed`, address: state[key] }]
    }
  }
}
