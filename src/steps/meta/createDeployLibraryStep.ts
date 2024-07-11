import { ContractFactory, InterfaceAbi } from 'ethers'
import { MigrationState, MigrationStep } from '../../migrations'

export default function createDeployLibraryStep({
  key,
  artifact: { contractName, abi, bytecode },
}: {
  key: keyof MigrationState
  artifact: { contractName: string; abi: InterfaceAbi; bytecode: string }
}): MigrationStep {
  return async (state, { signer, gasPrice }) => {
    if (state[key] === undefined) {
      const factory = new ContractFactory(abi, bytecode, signer)

      const library = await factory.deploy({ gasPrice })
      const tx = await library.waitForDeployment();
      const libraryAddr = await library.getAddress();
      state[key] = libraryAddr

      return [
        {
          message: `Library ${contractName} deployed`,
          address: libraryAddr,
          hash: tx.deploymentTransaction()?.hash
        },
      ]
    } else {
      return [{ message: `Library ${contractName} was already deployed`, address: state[key] }]
    }
  }
}
