import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const mockContract = {
  calculate: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue({
      logs: [
        {
          topics: ['0x...'],
          data: '0x...',
        },
      ],
    }),
    hash: '0xMockHash',
  }),
  getLastResult: jest.fn().mockResolvedValue([10n, 5n, 15n, 'add']),
  getHistoryLength: jest.fn().mockResolvedValue(2n),
  getHistoryItem: jest
    .fn()
    .mockResolvedValue([{ a: 10n, b: 5n, result: 15n, operation: 'add' }]),
  interface: {
    parseLog: jest.fn().mockImplementation(() => ({
      name: 'Calculate',
      args: { result: 99 },
    })),
  },
};

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    ethers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getBalance: jest.fn(),
      })),
      Wallet: jest.fn().mockImplementation(() => ({
        address: '0xMockSigner',
      })),
      Contract: jest.fn().mockImplementation(() => mockContract),
    },
    zeroPadValue: jest.fn((data, len) => `padded(${data},${len})`),
    encodeBytes32String: jest.fn((str) => `encoded(${str})`),
    isBytesLike: jest.fn(() => true),
    toUtf8Bytes: jest.fn(() => new Uint8Array()),
    parseEther: jest.fn((val) => BigInt(Number(val) * 1e18)),
    formatEther: jest.fn((val) => (Number(val) / 1e18).toString()),
  };
});

describe('EthersService', () => {
  let service: EthersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RPC_URL') return 'https://mock.rpc';
              if (key === 'PRIVATE_KEY') return 'mockPrivateKey';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EthersService>(EthersService);
  });

  it('calculate()는 Calculate 이벤트로부터 result를 파싱해 리턴해야 합니다.', async () => {
    const result = await service.calculate(1, 2, 'add');
    expect(result).toBe(99);
  });

  it('getLastResult()는 address 기반 결과를 리턴해야 합니다.', async () => {
    const result = await service.getLastResult('0xabc');
    expect(result).toEqual([10n, 5n, 15n, 'add']);
  });

  it('getHistoryLength()는 address 기반 히스토리 길이를 리턴해야 합니다.', async () => {
    const result = await service.getHistoryLength('0xabc');
    expect(result).toBe(2n);
  });

  it('getHistoryItem()은 address 기반 히스토리 배열을 리턴해야 합니다.', async () => {
    const result = await service.getHistoryItem('0xabc');
    expect(result).toEqual([{ a: 10n, b: 5n, result: 15n, operation: 'add' }]);
  });
});
