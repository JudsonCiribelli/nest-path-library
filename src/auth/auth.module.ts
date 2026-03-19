import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { BcryptServiceProtocol } from './hash/bcrypt.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingServiceProtocol,
      useClass: BcryptServiceProtocol,
    },
  ],
  exports: [HashingServiceProtocol],
})
export class AuthModule {}
