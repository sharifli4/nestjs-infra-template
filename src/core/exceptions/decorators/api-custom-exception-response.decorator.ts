import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseExceptionResponseDto } from '../base-exception-response.dto';

/**
 * Swagger decorator for custom exception responses
 * @param statusCode HTTP status code
 * @param description Description of the error scenario
 * @param exampleDto Optional specific exception DTO for examples
 */
export const ApiCustomExceptionResponse = (
  statusCode: number,
  description: string,
  exampleDto?: Type<any>,
) => {
  const decorators = [
    ApiExtraModels(BaseExceptionResponseDto),
    ApiResponse({
      status: statusCode,
      description,
      schema: {
        $ref: getSchemaPath(BaseExceptionResponseDto),
      },
    }),
  ];

  if (exampleDto) {
    decorators.unshift(ApiExtraModels(exampleDto));
  }

  return applyDecorators(...decorators);
};
