import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_TOKEN_PAYLOAD } from 'src/auth/common/auth.constants';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const payload = request[REQUEST_TOKEN_PAYLOAD];

    if (!payload) return null;

    return data ? payload[data] : payload;
  },
);
