import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CalculateDto {
  @IsNotEmpty()
  @IsNumber()
  a: number;

  @IsNotEmpty()
  @IsNumber()
  b: number;

  @IsNotEmpty()
  @IsString()
  operation: string;
}
