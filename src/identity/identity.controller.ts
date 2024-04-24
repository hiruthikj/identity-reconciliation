import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { UserIdentityDTO } from './dto/user-identify.dto';
import { IdentityService } from './identity.service';
import { HttpStatusCode } from 'axios';

@Controller('')
export class IdentityController {
  constructor(private readonly service: IdentityService) {}

  @Post('identify')
  @HttpCode(HttpStatusCode.Ok)
  async upsertIdentity(@Body() request: UserIdentityDTO) {
    if (request.email == null && request.phoneNumber == null) {
      throw new BadRequestException('Send required inputs');
    }

    return this.service.upsertUser(request);
  }
}
