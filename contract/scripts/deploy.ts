import { ethers } from 'hardhat';
import { makeAbi } from './abiGenerator';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Todo: deploy script를 구현하여 주세요.
  console.log("Deploying MathLibrary...");
  const MathLibrary = await ethers.getContractFactory('MathLibrary');
  const mathLibrary = await MathLibrary.deploy();
  await mathLibrary.waitForDeployment();
  console.log(`MathLibrary deployed at: ${mathLibrary.target}`);

   // 2. Calculator 배포 (MathLibrary 링크)
   console.log("Deploying Calculator...");
   let Calculator;
   try {
     // MathLibrary를 라이브러리로 링크하여 Calculator 배포 시도
     Calculator = await ethers.getContractFactory('Calculator', {
       libraries: {
         MathLibrary: mathLibrary.target,
       },
     });
   } catch (error) {
     // MathLibrary 링크가 필요하지 않은 경우 일반 배포
     Calculator = await ethers.getContractFactory('Calculator');
   }
   
   const contract = await Calculator.deploy();
   await contract.waitForDeployment();



  console.log(`Calculator contract deployed at: ${contract.target}`);
  await makeAbi('Calculator', contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
