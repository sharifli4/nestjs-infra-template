---
name: create-nestjs-exception
description: Create standardized exceptions following the template's exception system. Use when the user asks to create an exception, error class, or custom error handling, or mentions "exception", "error", "throw", or HTTP status codes.
license: MIT
metadata:
  version: "1.0"
  category: code-generation
compatibility: Works with all AI coding agents supporting Agent Skills spec
---

# Create NestJS Exception

Create standardized exceptions following this project's patterns.

## Quick Start

When creating an exception:

1. **Check if a core exception exists first** - Can you reuse `NotFoundException`, `CustomBadRequestException`?
2. **Determine location** - Feature-specific or core/reusable?
3. **Follow naming** - `{Concept}{Action}Exception`
4. **Use BaseExceptionDto** - Required for all exceptions
5. **Pick ExceptionTypeEnum** - From available types
6. **Add Swagger docs** - Document in controller

## Exception Template

```typescript
// Location:
// - Feature-specific: src/features/{feature}/exceptions/{exception-name}.exception.ts
// - Reusable: src/core/exceptions/http/{exception-name}.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum, BaseExceptionDto } from '@/core/exceptions';

/**
 * Thrown when [describe specific condition]
 * 
 * @example
 * throw new {ExceptionName}(identifier);
 */
export class {ExceptionName} extends HttpException {
  constructor(identifier: string | number) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [identifier.toString()],
      HttpStatus.{STATUS_CODE},
      ExceptionTypeEnum.{TYPE},
      '{Detailed error message}',
    );
    super(baseExceptionDto, HttpStatus.{STATUS_CODE});
  }
}
```

## Available Exception Types

```typescript
ExceptionTypeEnum.BAD_REQUEST           // Invalid request data
ExceptionTypeEnum.NOT_FOUND             // Resource not found
ExceptionTypeEnum.VALIDATION            // DTO validation failures
ExceptionTypeEnum.UNAUTHORIZED          // No authentication
ExceptionTypeEnum.FORBIDDEN             // Insufficient permissions
ExceptionTypeEnum.CONFLICT              // Resource conflict
ExceptionTypeEnum.UNIQUE_VIOLATION      // DB unique constraint
ExceptionTypeEnum.UNPROCESSABLE_ENTITY  // Cannot process valid request
ExceptionTypeEnum.INTERNAL_SERVER_ERROR // Server-side errors
```

## Quick Patterns

### Not Found
```typescript
export class {Resource}NotFoundException extends HttpException {
  constructor(id: string) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [id],
      HttpStatus.NOT_FOUND,
      ExceptionTypeEnum.NOT_FOUND,
      `{Resource} with ID ${id} not found`,
    );
    super(baseExceptionDto, HttpStatus.NOT_FOUND);
  }
}
```

### Validation with Multiple Fields
```typescript
export class Invalid{Resource}DataException extends HttpException {
  constructor(fields: string[], detail: string) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      fields,
      HttpStatus.BAD_REQUEST,
      ExceptionTypeEnum.VALIDATION,
      detail,
    );
    super(baseExceptionDto, HttpStatus.BAD_REQUEST);
  }
}
```

### Business Logic
```typescript
export class {BusinessRule}Exception extends HttpException {
  constructor(detail: string) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [],
      HttpStatus.UNPROCESSABLE_ENTITY,
      ExceptionTypeEnum.UNPROCESSABLE_ENTITY,
      detail,
    );
    super(baseExceptionDto, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
```

## Reuse Core Exceptions

**Always check first:** Can you use an existing core exception?

```typescript
import {
  CustomBadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  DatabaseOperationException,
} from '@/core/exceptions';

// Generic not found
throw new NotFoundException('User', userId);

// Generic validation
throw new CustomBadRequestException(
  ['email'],
  ExceptionTypeEnum.VALIDATION,
  'Invalid email format'
);
```

**Create custom exceptions only when:**
- Core exceptions don't cover the use case
- You need feature-specific error details
- You want better type safety

## Swagger Documentation

Always document in controllers:

```typescript
import { ApiCustomExceptionResponse } from '@/core/exceptions';

@Post()
@ApiCustomExceptionResponse(400, 'Invalid data')
@ApiCustomExceptionResponse(409, 'Resource conflict')
async create(@Body() dto: CreateDto) {
  // Implementation
}
```

## Checklist

Before creating an exception:

- [ ] Checked if core exceptions can be reused
- [ ] Determined location (feature-specific or core)
- [ ] Name follows `{Concept}{Action}Exception` format
- [ ] Extends `HttpException`
- [ ] Uses `BaseExceptionDto.CreateBaseException()`
- [ ] Includes proper `ExceptionTypeEnum`
- [ ] Has JSDoc with description and example
- [ ] Target array specifies relevant fields
- [ ] Documented with `@ApiCustomExceptionResponse`

## Rules

❌ **NEVER** use raw NestJS exceptions:
```typescript
// ❌ WRONG
throw new BadRequestException('Error');
throw new NotFoundException('Not found');
```

✅ **ALWAYS** use BaseExceptionDto system:
```typescript
// ✅ CORRECT
throw new NotFoundException('User', userId);
// Or create custom
throw new UserNotFoundException(userId);
```

⚠️ **PREFER** core exceptions when possible - don't create unnecessary custom exceptions.

## Full Documentation

See `.cursor/rules/exceptions.mdc` for complete rules and patterns.
