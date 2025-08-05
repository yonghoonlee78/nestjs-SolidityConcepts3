import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ethers,
  zeroPadValue,
  encodeBytes32String,
  isBytesLike,
  toUtf8Bytes,
  parseEther,
  formatEther,
  LogDescription,
} from 'ethers';
import { abi, address } from '../../../abis/Calculator.json';

@Injectable()
export class EthersService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey!, this.provider);
    this.contract = new ethers.Contract(address, abi, this.signer);
  }

  zeroPadValue32(data: string) {
    return zeroPadValue(data, 32);
  }

  encodeBytes32String(data: string) {
    return encodeBytes32String(data);
  }

  isBytesLike(data: string) {
    return isBytesLike(data);
  }

  toUtf8Bytes(data: string) {
    return toUtf8Bytes(data);
  }

  parseEther(data: string) {
    return parseEther(data);
  }

  formatEther(data: bigint) {
    return formatEther(data);
  }

  // 위 코드는 지우지 마세요.

  async calculate(a: number, b: number, operation: string) {
    // Todo: calculate 함수를 실행하여 Calculate 이벤트의 값을 받아 리턴합니다.
    // ⚠️ 리턴은 Number 단위로 리턴합니다.
    
    try {
      // 트랜잭션 실행
      const tx = await this.contract.calculate(a, b, operation);
      
      // 트랜잭션 완료 대기
      const receipt = await tx.wait();
      
      // 로그에서 Calculate 이벤트 찾기
      for (const log of receipt.logs) {
        try {
          // 로그를 파싱하여 이벤트 확인
          const parsedLog = this.contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          // Calculate 이벤트인지 확인
          if (parsedLog?.name === 'Calculate') {
            // result 값을 Number로 변환하여 반환
            return Number(parsedLog.args.result);
          }
        } catch (parseError) {
          // 파싱 실패한 로그는 무시하고 계속
          continue;
        }
      }
      
      throw new Error('Calculate event not found in transaction logs');
    } catch (error) {
      throw error;
    }
  }


  async getLastResult(address: string) {
    // Todo: getLastResult의 값을 리턴합니다.
    
    try {
      const result = await this.contract.getLastResult(address);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getHistoryLength(address: string) {
    // Todo: getHistoryLength의 값을 리턴합니다.
    
    try {
      const length = await this.contract.getHistoryLength(address);
      return length;
    } catch (error) {
      throw error;
    }
  }

  async getHistoryItem(address: string) {
    // Todo: getHistoryItem의 값을 리턴합니다.
    
    try {
      const historyItems = await this.contract.getHistoryItem(address);
      return historyItems;
    } catch (error) {
      throw error;
    }
  }

  async getContractInfo() {
    try {
      const network = await this.provider.getNetwork();
      
      return {
        contractAddress: address, // ABI 파일에서 가져온 주소
        network: network.name,
        chainId: Number(network.chainId),
        rpcUrl: this.configService.get<string>('RPC_URL'),
        signerAddress: this.signer.address
      };
    } catch (error) {
      throw error;
    }
  }
}
