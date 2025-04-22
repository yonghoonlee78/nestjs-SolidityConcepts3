import { Module } from '@nestjs/common';
import { CalculatorService } from './service/calculator.service';
import { CalculatorController } from './controller/calculator.controller';
import { EthersService } from '../ethers/ethers.service';

@Module({
  controllers: [CalculatorController],
  providers: [CalculatorService, EthersService],
})
export class CalculatorModule {}
