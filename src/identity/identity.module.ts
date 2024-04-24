import { Logger, Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

@Module({
  providers: [IdentityService, Logger],
  controllers: [IdentityController],
})
export class IdentityModule {}
