import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum } from '../exception-type.enum';
import { BaseExceptionDto } from '../base-exception.dto';

export class CustomBadRequestException extends HttpException {
  constructor(fields: string[], type: ExceptionTypeEnum, detail = '') {
    const baseExceptionDto: BaseExceptionDto =
      BaseExceptionDto.CreateBaseException(
        fields,
        HttpStatus.BAD_REQUEST,
        type,
        detail,
      );
    super(baseExceptionDto, HttpStatus.BAD_REQUEST);
  }
}
