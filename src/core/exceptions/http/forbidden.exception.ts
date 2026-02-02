import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum } from '../exception-type.enum';
import { BaseExceptionDto } from '../base-exception.dto';

export class ForbiddenException extends HttpException {
  constructor(resource: string) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [],
      HttpStatus.FORBIDDEN,
      ExceptionTypeEnum.FORBIDDEN,
      `You do not have permission to access ${resource}`,
    );
    super(baseExceptionDto, HttpStatus.FORBIDDEN);
  }
}
