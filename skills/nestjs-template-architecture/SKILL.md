---
name: nestjs-template-architecture
description: Understand and follow the NestJS infrastructure template architecture patterns. Use when the user asks about project structure, architecture decisions, where to put code, or mentions organizing code, folder structure, or modular design.
license: MIT
metadata:
  version: "1.0"
  category: architecture
compatibility: Works with all AI coding agents supporting Agent Skills spec
---

# NestJS Template Architecture

Understand and work with this pragmatic, SOLID-based NestJS infrastructure template.

## Core Principles

1. **Modular by Feature** - Organize by feature/module, keep related code together
2. **Single Responsibility** - Each class/module has one clear purpose
3. **Dependency Injection** - Use NestJS DI, depend on abstractions not concrete implementations
4. **Optional Infrastructure** - Database, Redis, Vault are opt-in via env flags
5. **Design Patterns** - Factory, Builder patterns for flexible module loading
6. **Standardized Exceptions** - All exceptions use BaseExceptionDto

## Project Structure

```
src/
├── core/                    # Shared infrastructure
│   ├── exceptions/          # Exception handling system
│   │   ├── http/            # HTTP exceptions
│   │   ├── database/        # Database exceptions
│   │   └── decorators/      # Swagger decorators
│   └── factories/           # Module loading patterns
│
├── config/                  # Infrastructure configs
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── logger.config.ts
│
├── database/                # Base entities
├── logger/                  # Logging infrastructure
├── redis/                   # Caching infrastructure
│
└── features/                # Feature modules (organized by feature)
    ├── users/
    │   ├── config/          # Feature-specific config (optional)
    │   ├── entities/        # Entities
    │   ├── dto/             # DTOs
    │   ├── exceptions/      # Feature-specific exceptions
    │   ├── services/        # Business logic
    │   ├── controllers/     # HTTP endpoints
    │   ├── tests/           # Tests
    │   └── users.module.ts
    │
    └── [other-features]/
```

## Where to Put Code

### Core Infrastructure (`src/core/`)
Put here if it's:
- Exception handling system
- Global guards (auth, roles)
- Global interceptors
- Global decorators
- Module factories
- Reusable utilities used across multiple features

### Infrastructure Folders
- `src/logger/` - Logging infrastructure
- `src/redis/` - Caching infrastructure
- `src/database/` - Base entities
- `src/config/` - Infrastructure configs

### Feature Folders (`src/features/{feature}/`)
Put here if it's:
- Feature-specific business logic
- Entities for this feature
- DTOs for this feature
- Feature-specific exceptions
- Services and controllers
- Feature-specific config (if needed)
- Tests for this feature
- Feature-specific utilities

**Rule of thumb:** If it's used by 3+ features → move to `core/`. If it's feature-specific → keep in feature folder.

## Optional Infrastructure

Control via environment variables:

```bash
USE_DATABASE=true   # Enable PostgreSQL with MikroORM
USE_REDIS=true      # Enable Redis caching
USE_VAULT=true      # Enable HashiCorp Vault
```

### Common Configurations

| Setup | Database | Redis | Vault | Use Case |
|-------|----------|-------|-------|----------|
| Minimal | ❌ | ❌ | ❌ | Stateless API |
| Standard | ✅ | ❌ | ❌ | Database-driven app |
| Performance | ✅ | ✅ | ❌ | With caching |
| Production | ✅ | ✅ | ✅ | Full stack |

## Design Patterns

### Factory Pattern
Module creation is handled by factories:
```typescript
DatabaseModuleFactory.create()  // Creates database module
RedisModuleFactory.create()     // Creates Redis module
```

### Builder Pattern
Infrastructure modules are built fluently:
```typescript
InfrastructureModuleBuilder.create()
  .withLogger()
  .withDatabase()
  .withRedis()
  .build()
```

### Strategy Pattern
Runtime decisions on module loading based on env flags.

## Configuration Management

### Feature Configuration (Optional)
Features can have their own config if needed:

```typescript
// Users feature config (if complex enough to warrant it)
registerAs('users', () => ({
  maxLoginAttempts: process.env.USERS_MAX_LOGIN_ATTEMPTS,
}));

// Simple features can access process.env directly in services
```

**Rule:** Use `registerAs` for complex config with multiple properties. For 1-2 env vars, direct access is fine.

### Environment Variable Naming

```bash
# Infrastructure (no prefix)
DB_HOST=localhost
REDIS_PORT=6379

# Feature-specific (with prefix for clarity)
USERS_MAX_LOGIN_ATTEMPTS=5
PAYMENTS_STRIPE_API_KEY=sk_test_...
NOTIFICATIONS_SMTP_HOST=smtp.example.com
```

## Exception Handling

All exceptions use the standardized system:

```typescript
import { ExceptionTypeEnum, BaseExceptionDto } from '@/core/exceptions';

export class UserNotFoundException extends HttpException {
  constructor(id: string) {
    const baseExceptionDto = BaseExceptionDto.CreateBaseException(
      [id],
      HttpStatus.NOT_FOUND,
      ExceptionTypeEnum.NOT_FOUND,
      `User with ID ${id} not found`,
    );
    super(baseExceptionDto, HttpStatus.NOT_FOUND);
  }
}
```

**Never use raw NestJS exceptions** like `BadRequestException`, `NotFoundException`.

## Dependency Rules (Dependency Inversion)

```
Features should:
  ✅ Depend on abstractions (interfaces, base classes)
  ✅ Use core infrastructure
  ✅ Use shared infrastructure (logger, redis)
  ⚠️  Minimize dependencies on other features (use events if needed)

Core/Infrastructure:
  ✅ Provides abstractions and base implementations
  ❌ Should not depend on specific features
```

**Key principle:** Depend on abstractions, not concrete implementations. Use dependency injection.

## Common Patterns

### Creating a New Feature

1. Create folder: `src/features/{feature}/`
2. Create module, service, controller
3. Add entities, DTOs as needed
4. Register module in `app.module.ts`
5. Add env vars if needed

### Creating an Exception

1. Put in feature's `exceptions/` folder (if feature-specific)
2. Or in `core/exceptions/` if reusable
3. Extend `HttpException`
4. Use `BaseExceptionDto.CreateBaseException()`
5. Document with `@ApiCustomExceptionResponse`

### Sharing Logic Between Features

**When to share:**
- Used by 3+ features → Extract to `src/core/services/`
- Feature coupling is OK → Direct import (use sparingly)
- Features shouldn't know about each other → Use events

**Keep it simple:** Don't over-engineer. If two features need to share a utility, put it in core.

## Quick Reference

### ✅ DO
- Organize by feature
- Keep each class focused (Single Responsibility)
- Use dependency injection
- Depend on interfaces/abstractions when possible
- Use BaseExceptionDto for exceptions
- Put tests with code
- Use feature prefixes for env vars

### ❌ DON'T
- Mix multiple responsibilities in one class
- Use raw NestJS exceptions (use BaseExceptionDto)
- Create tight coupling between features
- Put feature-specific logic in core
- Over-engineer simple things

## Documentation

For detailed information, see:
- `.cursor/rules/exceptions.mdc` - Exception handling patterns
- `.cursor/rules/architecture.mdc` - Architecture guidelines
- `DESIGN_PATTERNS.md` - Design patterns explained
- `OPTIONAL_FEATURES.md` - Optional infrastructure guide

## Skills Available

Use these skills for specific tasks:
- `create-nestjs-exception` - Create standardized exceptions
- `create-nestjs-feature` - Create complete feature modules
- `create-nestjs-config` - Create feature configuration

## Getting Started

To work with this template:

1. **Identify the feature** - Which feature module am I working in?
2. **Follow SOLID principles** - Keep classes focused, use DI
3. **Look at examples** - Use existing code as patterns
4. **Use the skills** - Leverage skills for common tasks
5. **Keep it simple** - Don't over-engineer

This template prioritizes pragmatism, maintainability, and SOLID principles without unnecessary complexity.
