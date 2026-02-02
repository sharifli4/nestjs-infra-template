import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ExceptionTypeEnum } from '../exception-type.enum';
import { BaseExceptionDto } from '../base-exception.dto';

export class DatabaseOperationException extends HttpException {
  private readonly logger: Logger = new Logger(
    DatabaseOperationException.name,
  );

  constructor(error: Error, methodName: string) {
    const baseExceptionDto: BaseExceptionDto =
      BaseExceptionDto.CreateBaseException(
        [],
        HttpStatus.INTERNAL_SERVER_ERROR,
        ExceptionTypeEnum.INTERNAL_SERVER_ERROR,
        error.message,
      );

    super(baseExceptionDto, HttpStatus.INTERNAL_SERVER_ERROR);

    this.logger.error(
      `Database operation ${methodName} failed: ${error.message}`,
      error.stack,
    );
  }
}
