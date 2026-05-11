import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@avancepharma/shared';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
