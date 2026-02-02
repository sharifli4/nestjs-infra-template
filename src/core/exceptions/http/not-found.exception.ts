import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum } from '../exception-type.enum';
import { BaseExceptionDto } from '../base-exception.dto';

export class NotFoundException extends HttpException {
  constructor(resource: string, identifier: string | number) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [identifier.toString()],
      HttpStatus.NOT_FOUND,
      ExceptionTypeEnum.NOT_FOUND,
      `${resource} with identifier ${identifier} not found`,
    );
    super(baseExceptionDto, HttpStatus.NOT_FOUND);
  }
}
