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
}
