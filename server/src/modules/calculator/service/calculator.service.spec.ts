import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorService } from './calculator.service';
import { EthersService } from '../../ethers/ethers.service';
import { exceptions } from '../../../common/exceptions/exception.config';

const mockEthersService = {
  calculate: jest.fn(),
  getLastResult: jest.fn(),
  getHistoryLength: jest.fn(),
  getHistoryItem: jest.fn(),
};

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculatorService,
        { provide: EthersService, useValue: mockEthersService },
      ],
    }).compile();

    service = module.get<CalculatorService>(CalculatorService);
  });

  it('calculate()는 이벤트를 참고하여 결과를 반환해야 합니다.', async () => {
    mockEthersService.calculate.mockResolvedValue('receipt');
    expect(await service.calculate(2, 3, 'add')).toBe('receipt');
  });

  it('getLastResult()는 최종 계산 결과를 반환해야 합니다.', async () => {
    mockEthersService.getLastResult.mockResolvedValue([10n, 5n, 15n, 'add']);
    const result = await service.getLastResult('0xabc');
    expect(result).toEqual({ a: 10, b: 5, result: 15, operation: 'add' });
  });

  it('getLastResult()는 실행 이력이 없을 경우 예외를 던져야 합니다.', async () => {
    mockEthersService.getLastResult.mockRejectedValue({
      reason: 'No calculation history',
    });
    await expect(service.getLastResult('0xabc')).rejects.toEqual(
      exceptions.NO_CALCULATION_HISTORY
    );
  });

  it('getHistoryLength()는 이력 길이를 반환해야 합니다.', async () => {
    mockEthersService.getHistoryLength.mockResolvedValue(2n);
    expect(await service.getHistoryLength('0xabc')).toBe(2);
  });

  it('getHistoryLength()는 0일 경우 예외를 던져야 합니다.', async () => {
    mockEthersService.getHistoryLength.mockResolvedValue(0n);
    await expect(service.getHistoryLength('0xabc')).rejects.toEqual(
      exceptions.NO_CALCULATION_HISTORY
    );
  });

  it('getHistoryItem()은 이력 리스트를 반환해야 합니다.', async () => {
    mockEthersService.getHistoryItem.mockResolvedValue([
      { a: 10n, b: 5n, result: 15n, operation: 'add' },
      { a: 20n, b: 5n, result: 25n, operation: 'add' },
    ]);

    const result = await service.getHistoryItem('0xabc');
    expect(result).toEqual([
      { a: 10, b: 5, result: 15, operation: 'add' },
      { a: 20, b: 5, result: 25, operation: 'add' },
    ]);
  });

  it('getHistoryItem()은 실행 이력이 없을 경우 예외를 던져야 합니다.', async () => {
    mockEthersService.getHistoryItem.mockRejectedValue({
      reason: 'No calculation history',
    });
    await expect(service.getHistoryItem('0xabc')).rejects.toEqual(
      exceptions.NO_CALCULATION_HISTORY
    );
  });
});
