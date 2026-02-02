---
name: create-nestjs-feature
description: Create new feature modules following modular architecture and SOLID principles. Use when the user asks to create a new module, feature, or service, or mentions "new feature", "new module", or specific features like users, orders, payments, etc.
license: MIT
metadata:
  version: "1.0"
  category: code-generation
compatibility: Works with all AI coding agents supporting Agent Skills spec
---

# Create NestJS Feature

Create complete feature modules following SOLID principles.

## Quick Start

1. **Choose feature name** - Singular, lowercase (e.g., `users`, `orders`, `payments`)
2. **Create folder structure** in `src/features/{feature}/`
3. **Create module** and register in app.module.ts
4. **Add configuration** only if needed (keep it simple)
5. **Add environment variables** with feature prefix (if needed)

## Folder Structure Template

```bash
src/features/{feature}/
├── config/                          # Optional - only if needed
│   └── {feature}.config.ts
├── entities/
│   └── {feature}.entity.ts
├── dto/
│   ├── create-{feature}.dto.ts
│   └── update-{feature}.dto.ts
├── exceptions/                      # Optional - use core exceptions when possible
│   └── {feature}-not-found.exception.ts
├── services/
│   └── {feature}.service.ts
├── controllers/
│   └── {feature}.controller.ts
├── tests/
│   └── {feature}.service.spec.ts
└── {feature}.module.ts
```

**Keep it simple:** Only create folders/files you actually need. Start minimal, add as you grow.

## Step-by-Step Creation

### Step 1: Configuration (Optional)

**Only create if:** Feature has 3+ related config properties.

```typescript
// src/features/{feature}/config/{feature}.config.ts
import { registerAs } from '@nestjs/config';

export interface {Feature}Config {
  // Add feature-specific config properties
  property1: string;
  property2: number;
}

export default registerAs(
  '{feature}',  // Namespace
  (): {Feature}Config => ({
    property1: process.env.{FEATURE}_PROPERTY1 || 'default',
    property2: parseInt(process.env.{FEATURE}_PROPERTY2 || '0', 10),
  }),
);
```

**For simple features:** Access `process.env` directly in service. No need to over-engineer.

### Step 2: Entity

```typescript
// src/features/{feature}/entities/{feature}.entity.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '@/database/base.entity';

@Entity()
export class {Feature} extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  // Add feature-specific properties
}
```

### Step 3: DTOs

```typescript
// src/features/{feature}/dto/create-{feature}.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create{Feature}Dto {
  @ApiProperty({ example: 'Example name' })
  @IsString()
  @MinLength(3)
  name: string;
}
```

### Step 4: Exception (Optional)

**First check:** Can you use a core exception? (`NotFoundException`, `CustomBadRequestException`)

If feature-specific logic is needed:

```typescript
// src/features/{feature}/exceptions/{feature}-not-found.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTypeEnum, BaseExceptionDto } from '@/core/exceptions';

export class {Feature}NotFoundException extends HttpException {
  constructor(id: string | number) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [id.toString()],
      HttpStatus.NOT_FOUND,
      ExceptionTypeEnum.NOT_FOUND,
      `{Feature} with ID ${id} not found`,
    );
    super(baseExceptionDto, HttpStatus.NOT_FOUND);
  }
}
```

### Step 5: Service (Single Responsibility)

```typescript
// src/features/{feature}/services/{feature}.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { {Feature} } from '../entities/{feature}.entity';
import { {Feature}NotFoundException } from '../exceptions/{feature}-not-found.exception';

@Injectable()
export class {Feature}Service {
  constructor(
    @InjectRepository({Feature})
    private readonly repository: EntityRepository<{Feature}>,
    private readonly configService: ConfigService,
  ) {}

  async findOne(id: number): Promise<{Feature}> {
    const entity = await this.repository.findOne({ id });
    if (!entity) {
      throw new {Feature}NotFoundException(id);
    }
    return entity;
  }
  
  // Keep methods focused - one responsibility each
}
```

**Tip:** If service gets large (>200 lines), consider splitting responsibilities into separate services.

### Step 6: Controller

```typescript
// src/features/{feature}/controllers/{feature}.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCustomExceptionResponse } from '@/core/exceptions';
import { {Feature}Service } from '../services/{feature}.service';
import { Create{Feature}Dto } from '../dto/create-{feature}.dto';

@ApiTags('{feature}')
@Controller('{feature}')
export class {Feature}Controller {
  constructor(private readonly service: {Feature}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create {feature}' })
  @ApiCustomExceptionResponse(400, 'Invalid data')
  create(@Body() dto: Create{Feature}Dto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {feature} by ID' })
  @ApiCustomExceptionResponse(404, '{Feature} not found')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
```

### Step 7: Module

```typescript
// src/features/{feature}/{feature}.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {feature}Config from './config/{feature}.config';  // If using config
import { {Feature} } from './entities/{feature}.entity';
import { {Feature}Service } from './services/{feature}.service';
import { {Feature}Controller } from './controllers/{feature}.controller';

@Module({
  imports: [
    // Only if using feature-specific config:
    ConfigModule.forFeature({feature}Config),
    MikroOrmModule.forFeature([{Feature}]),
  ],
  controllers: [{Feature}Controller],
  providers: [{Feature}Service],
  exports: [{Feature}Service],  // Export if other features need it
})
export class {Feature}Module {}
```

### Step 8: Register in App Module

```typescript
// src/app.module.ts
import { {Feature}Module } from './features/{feature}/{feature}.module';

@Module({
  imports: [
    // ... existing imports
    {Feature}Module,
  ],
})
export class AppModule {}
```

### Step 9: Environment Variables (If Needed)

Add to `.env.example`:

```bash
# ==============================================================================
# {Feature} Feature Configuration
# ==============================================================================
{FEATURE}_PROPERTY1=value
{FEATURE}_PROPERTY2=123
```

## Checklist

- [ ] Created folder in `src/features/{feature}/`
- [ ] Created module and registered in `app.module.ts`
- [ ] Created entity extending `BaseEntity`
- [ ] Created DTOs with validation decorators
- [ ] Created service with focused methods
- [ ] Created controller with Swagger docs
- [ ] Used dependency injection
- [ ] Added feature-specific config (if needed)
- [ ] Added env vars to `.env.example` (if needed)
- [ ] Kept classes focused (Single Responsibility)

## SOLID Principles Applied

**Single Responsibility:** Each service/controller has one clear purpose
**Open/Closed:** Use inheritance (BaseEntity) and composition
**Liskov Substitution:** Entities can replace BaseEntity
**Interface Segregation:** Services depend only on what they need
**Dependency Inversion:** Depend on abstractions (use DI, inject interfaces)

## Rules

✅ **DO**:
- Put everything in `src/features/{feature}/`
- Keep each class focused (Single Responsibility)
- Use dependency injection
- Use feature prefix for env vars: `{FEATURE}_PROPERTY`
- Use `BaseEntity` for entities
- Document with Swagger decorators
- Start simple, add complexity only when needed

❌ **DON'T**:
- Mix multiple responsibilities in one class
- Create tight coupling between features
- Use raw NestJS exceptions
- Over-engineer simple features
- Create config files for 1-2 env vars

## Full Documentation

See `.cursor/rules/architecture.mdc` for complete architecture guidelines.
