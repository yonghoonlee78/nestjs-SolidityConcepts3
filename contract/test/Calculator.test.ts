import { expect } from 'chai';
import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

describe('Calculator', function () {
  let calculator: any;
  let mathLibrary: any;
  let owner: any;
  let otherAccount: any;
  let sourceCode: string;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    const MathLibrary = await ethers.getContractFactory('MathLibrary');
    mathLibrary = await MathLibrary.deploy();
    await mathLibrary.waitForDeployment();

    let Calculator: any;

    try {
      Calculator = await ethers.getContractFactory('Calculator', {
        libraries: {
          MathLibrary: mathLibrary.target,
        },
      });
    } catch (error) {
      Calculator = await ethers.getContractFactory('Calculator');
    }

    calculator = await Calculator.deploy();
    await calculator.waitForDeployment();

    const contractPath = path.join(__dirname, '../contracts/Calculator.sol');
    sourceCode = fs.readFileSync(contractPath, 'utf8');
  });

  describe('라이선스 및 Solidity 버전 검사', function () {
    it('컨트랙트에서 SPDX 주석으로 라이선스가 있어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Calculator.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');
      expect(sourceCode.match(/\/\/ SPDX-License-Identifier:/)).to.not.be.null;
    });

    it('컨트랙트에서 Solidity 버전이 0.8.0 이상, 0.9.0 미만이어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Calculator.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      const versionMatch = sourceCode.match(/pragma solidity\s+([^;]+);/);
      expect(versionMatch).to.not.be.null;

      const solidityVersion = versionMatch![1].trim();
      const validVersions = ['>=0.8.0 <0.9.0', '^0.8.0'];

      expect(validVersions.includes(solidityVersion)).to.be.true;
    });
  });

  describe('파일 import 및 상속 확인', function () {
    it('컨트랙트에서 AbstractCalculator.sol을 import해야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Calculator.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      expect(sourceCode.match(/import\s+["']\.\/AbstractCalculator\.sol["'];/))
        .to.not.be.null;
    });

    it('Calculator가 AbstractCalculator를 상속받아야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Calculator.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      expect(
        sourceCode.match(
          /\bcontract\s+Calculator\s+is\s+AbstractCalculator\s*{/
        )
      ).to.not.be.null;
    });
  });

  describe('Calculator 컨트랙트 필수 변수 검증', function () {
    it('LastResult struct가 정의되어 있어야 합니다.(uint256 a, uint256 b, uint256 result, string operation)', () => {
      const structRegex =
        /struct\s+LastResult\s*{[^}]*a[^}]*b[^}]*result[^}]*operation[^}]*}/s;
      const hasLastResultStruct = structRegex.test(sourceCode);
      expect(hasLastResultStruct).to.be.true;
    });

    it('(address => LastResult[])를 표현하는 history mapping이 있어야 합니다.', async () => {
      const calculate = await calculator.calculate(2, 3, 'add');
      await calculate.wait();
      const hasMapping = await calculator.getHistoryItem(owner.address);

      expect(hasMapping.length).to.equal(1);
    });
  });

  describe('Calculator 컨트랙트 이벤트 기반 검증', function () {
    it("calculate('add') 실행 시 Calculate 이벤트가 5를 포함해야 합니다.", async function () {
      await expect(calculator.calculate(2, 3, 'add'))
        .to.emit(calculator, 'Calculate')
        .withArgs(5);
    });

    it("calculate('subtract') 실행 시 Calculate 이벤트가 3을 포함해야 합니다.", async function () {
      await expect(calculator.calculate(5, 2, 'subtract'))
        .to.emit(calculator, 'Calculate')
        .withArgs(3);
    });

    it("calculate('multiply') 실행 시 Calculate 이벤트가 12를 포함해야 합니다.", async function () {
      await expect(calculator.calculate(3, 4, 'multiply'))
        .to.emit(calculator, 'Calculate')
        .withArgs(12);
    });

    it("calculate('divide') 실행 시 Calculate 이벤트가 4를 포함해야 합니다.", async function () {
      await expect(calculator.calculate(8, 2, 'divide'))
        .to.emit(calculator, 'Calculate')
        .withArgs(4);
    });

    it("calculate(8, 2, '잘못된 연산')은 Invalid operation을 revert해야 합니다.", async function () {
      await expect(
        calculator.calculate(8, 2, '잘못된 연산')
      ).to.be.revertedWith('Invalid operation');
    });
  });

  describe('Calculator 컨트랙트 확장 테스트', function () {
    it('계산 결과가 히스토리에 추가되어야 합니다.', async function () {
      await calculator.calculate(10, 5, 'add');
      const last = await calculator.getLastResult(owner.address);
      expect(last.a).to.equal(10);
      expect(last.b).to.equal(5);
      expect(last.result).to.equal(15);
      expect(last.operation).to.equal('add');
    });

    it('히스토리 길이는 계산한 횟수만큼 증가해야 합니다.', async function () {
      await calculator.calculate(1, 2, 'add');
      await calculator.calculate(3, 4, 'add');
      const length = await calculator.getHistoryLength(owner.address);
      expect(length).to.equal(2);
    });

    it('계산 없이 getLastResult()를 호출하면 "No calculation history" 오류가 발생해야 합니다.', async function () {
      await expect(
        calculator.getLastResult(otherAccount.address)
      ).to.be.revertedWith('No calculation history');
    });

    it('getHistoryItem 함수를 이용하여 특정 주소의 히스토리를 리턴해야 합니다.', async function () {
      await calculator.calculate(1, 2, 'add');
      await calculator.calculate(3, 4, 'add');
      const history = await calculator.getHistoryItem(owner.address);
      expect(history.length).to.equal(2);
    });

    it('getHistoryItem 실행 시 user의 히스토리가 없으면, "No calculation history" 오류가 발생해야 합니다.', async function () {
      await expect(
        calculator.getHistoryItem(otherAccount.address)
      ).to.be.revertedWith('No calculation history');
    });
  });
});
