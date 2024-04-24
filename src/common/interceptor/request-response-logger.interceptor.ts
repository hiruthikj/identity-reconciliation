import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map, tap } from 'rxjs';

@Injectable()
class ReqResLoggerInterceptor implements NestInterceptor {
  excludedPaths = ['/health', '/healthcheck'];

  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const { originalUrl, method, params, query, body } = req;

    if (this.excludedPaths.includes(originalUrl)) {
      return next.handle();
    }

    Logger.log(
      JSON.stringify({
        originalUrl,
        method,
        params,
        query,
        body,
      }),
      'ReqResLogger',
    );

    return next.handle().pipe(
      tap({
        next: (val: unknown): void => {
          const res: Response = context.switchToHttp().getResponse();
          // TODO: Handle non-JSON and large Outputs
          Logger.log(
            JSON.stringify({
              response: val,
              statusCode: res.statusCode,
            }),
          );
        },
        error: (err: Error): void => {
          Logger.warn('Could not log response for this request');
        },
      }),
    );
  }
}

export default ReqResLoggerInterceptor;
