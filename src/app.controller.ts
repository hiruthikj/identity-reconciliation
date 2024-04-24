import {
  Controller,
  Get,
  Header,
} from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

@Controller()
export class AppController {
  @Get('/healthcheck')
  @Header('Content-Type', 'text/html')
  @HealthCheck()
  healthcheck(): string {
    return 'OK';
  }
}
