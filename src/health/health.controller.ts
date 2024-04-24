import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly dbHealthIndicator: SequelizeHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return await this.healthCheckService.check([
      async () =>
        await this.memoryHealthIndicator.checkHeap(
          'memory heap',
          this.configService.getOrThrow<number>('terminus.heapUsedThreshold'),
        ),
      async () =>
        await this.memoryHealthIndicator.checkRSS(
          'memory RSS',
          this.configService.getOrThrow<number>('terminus.rssThreshold'),
        ),
      async () =>
        await this.diskHealthIndicator.checkStorage('disk health', {
          thresholdPercent: this.configService.getOrThrow<number>(
            'terminus.storageThresholdPercent',
          ),
          path: '/',
        }),
      async () => await this.dbHealthIndicator.pingCheck('database'),
    ]);
  }
}

export default HealthController;
