import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const status = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({
        status: 'SUCCESS',
        statusCode: status,
        data: data || {},
      }))
    );
  }
}
