import { HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum } from './exception-type.enum';
import { GetEnumByValue } from './utils/get-enum-by-value';

export class BaseExceptionDto {
  status: number;
  message: string;
  code: string;
  target: string[];
  timestamp: Date;
  type: ExceptionTypeEnum;
  detail: string;

  private constructor(
    columns: string[],
    status: number,
    type: ExceptionTypeEnum,
    detail: string,
  ) {
    this.code = GetEnumByValue(status, HttpStatus) || 'UNKNOWN';
    this.status = status;
    this.target = columns.filter((col: string) => col.trim() !== '');
    this.timestamp = new Date();
    this.type = type;

    const errorName: string =
      this.code?.replace(/_/g, ' ')?.toLowerCase() ?? 'unknown';
    this.message =
      this.target.length > 0
        ? `${errorName} error(s) in ${this.target.join(', ')}`
        : `${errorName} error(s)`;
    this.detail = detail;
  }

  static CreateBaseException(
    columns: string[],
    status: number,
    type: ExceptionTypeEnum,
    detail = '',
  ): BaseExceptionDto {
    return new BaseExceptionDto(columns, status, type, detail);
  }
}
