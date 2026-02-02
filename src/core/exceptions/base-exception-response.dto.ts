import { ApiProperty } from '@nestjs/swagger';
import { ExceptionTypeEnum } from './exception-type.enum';

export class BaseExceptionResponseDto {
  @ApiProperty({ name: 'status', type: Number })
  status: number;

  @ApiProperty({ name: 'message', type: String })
  message: string;

  @ApiProperty({ name: 'code', type: String })
  code: string;

  @ApiProperty({ name: 'target', type: [String] })
  target: string[];

  @ApiProperty({ name: 'timestamp', type: Date })
  timestamp: Date;

  @ApiProperty({
    name: 'type',
    enum: ExceptionTypeEnum,
    enumName: 'ExceptionTypeEnum',
  })
  type: ExceptionTypeEnum;

  @ApiProperty({ name: 'detail', type: String })
  detail: string;
}
