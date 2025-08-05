import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { CalculatorService } from '../service/calculator.service';
import { CalculateDto } from '../dto/calculate.dto';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  /*
    Todo: 다음의 기능에 따른 Restful API를 재량것 만들어주시기 바랍니다.

    - calculate 실행 API(CalculateDto를 사용해야 합니다.)
    - 마지막 계산 결과 가져오기(getLastResult)
    - 계산한 횟수 가져오기(getHistoryLength)
    - 계산한 히스토리 가져오기(getHistoryItem)
  */
   /**
   * 계산 실행 API
   * POST /calculator/calculate
   */
   @Post('calculate')
   async calculate(@Body() calculateDto: CalculateDto) {
     return await this.calculatorService.calculate(
       calculateDto.a,
       calculateDto.b,
       calculateDto.operation
     );
   }
 
   /**
    * 마지막 계산 결과 가져오기
    * GET /calculator/last-result?address=0x...
    */
   @Get('last-result')
   async getLastResult(@Query('address') address: string) {
     return await this.calculatorService.getLastResult(address);
   }
 
   /**
    * 계산한 횟수 가져오기
    * GET /calculator/history-length?address=0x...
    */
   @Get('history-length')
   async getHistoryLength(@Query('address') address: string) {
     return await this.calculatorService.getHistoryLength(address);
   }
 
   /**
    * 계산한 히스토리 가져오기
    * GET /calculator/history?address=0x...
    */
   @Get('history')
   async getHistoryItem(@Query('address') address: string) {
     return await this.calculatorService.getHistoryItem(address);
   }
 
   /**
    * 특정 사용자의 모든 정보 가져오기 (편의 기능)
    * GET /calculator/user/:address
    */
   @Get('user/:address')
   async getUserInfo(@Param('address') address: string) {
     const [lastResult, historyLength, history] = await Promise.all([
       this.calculatorService.getLastResult(address).catch(() => null),
       this.calculatorService.getHistoryLength(address),
       this.calculatorService.getHistoryItem(address).catch(() => [])
     ]);
 
     return {
       address,
       lastResult,
       historyLength,
       history
     };
   }
 
   /**
    * 컨트랙트 정보 가져오기
    * GET /calculator/info
    */
   @Get('info')
   async getContractInfo() {
     return await this.calculatorService.getContractInfo();
   }
 }

