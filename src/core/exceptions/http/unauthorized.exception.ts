import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum } from '../exception-type.enum';
import { BaseExceptionDto } from '../base-exception.dto';

export class UnauthorizedException extends HttpException {
  constructor(detail = 'Authentication required') {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [],
      HttpStatus.UNAUTHORIZED,
      ExceptionTypeEnum.UNAUTHORIZED,
      detail,
    );
    super(baseExceptionDto, HttpStatus.UNAUTHORIZED);
  }
}
