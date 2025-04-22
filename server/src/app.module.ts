import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EthersService } from './modules/ethers/ethers.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CalculatorModule } from './modules/calculator/calculator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    CalculatorModule,
  ],
  controllers: [AppController],
  providers: [AppService, EthersService],
  exports: [EthersService],
})
export class AppModule {}
