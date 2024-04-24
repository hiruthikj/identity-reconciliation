import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
import { UserIdentityDTO } from './dto/user-identify.dto';
import { IdentityService } from './identity.service';
import { HttpStatusCode } from 'axios';
import { APIResponseBuilder } from 'src/common/utils/api-response-builder';

@Controller('')
export class IdentityController {
  constructor(
    private readonly service: IdentityService,
    private readonly logger: Logger,
  ) {}

  @Post('identify')
  @HttpCode(HttpStatusCode.Ok)
  async upsertIdentity(@Body() request: UserIdentityDTO) {
    try {
      if (request.email == null && request.phoneNumber == null) {
        throw new BadRequestException('Send required inputs');
      }

      return this.service.upsertUser(request);
    } catch (err) {
      this.logger.error(`upsertIdentity failed: ${err.mesage}`);
      // TODO: Status Code
      return APIResponseBuilder.error(err?.mesage ?? 'Internal Error').build();
    }
  }
}
