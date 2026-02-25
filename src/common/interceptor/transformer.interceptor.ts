import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  timestamp: string;
  count?: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const sanitizedData = this.removeSensitiveFields(data) as T;

        return {
          data: sanitizedData,
          timestamp: new Date().toISOString(),
          count: Array.isArray(data) ? data.length : undefined,
        };
      }),
    );
  }

  private removeSensitiveFields(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.removeSensitiveFields(item));
    }

    const obj = { ...(data as Record<string, unknown>) };

    if ('password' in obj) {
      delete obj.password;
    }

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        obj[key] = this.removeSensitiveFields(obj[key]);
      }
    }

    return obj;
  }
}
