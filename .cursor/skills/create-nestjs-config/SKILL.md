---
name: create-nestjs-config
description: Create feature configuration when needed. Use when the user asks to add configuration with multiple related settings, or mentions environment variables for a feature with complex config needs.
license: MIT
metadata:
  version: "1.0"
  category: code-generation
compatibility: Works with all AI coding agents supporting Agent Skills spec
---

# Create NestJS Configuration

Create feature configuration when complexity warrants it.

## When to Create Config Files

**Create `registerAs` config file if:**
- Feature has 3+ related configuration properties
- Configuration has complex validation logic
- Multiple services need the same config

**Use direct `process.env` if:**
- Feature has 1-2 simple env vars
- Config is only used in one place
- No complex validation needed

**Keep it simple:** Don't over-engineer configuration.

## Quick Start

1. **Assess complexity** - Does this feature need a config file?
2. **Create config file** with `registerAs` (if needed)
3. **Define TypeScript interface**
4. **Add environment variables** with feature prefix
5. **Register in module**
6. **Access type-safely in services**

## Configuration Template

### Feature Configuration (Complex Features)

```typescript
// src/features/{feature}/config/{feature}.config.ts
import { registerAs } from '@nestjs/config';

/**
 * {Feature} feature configuration
 * Namespace: '{feature}'
 */
export interface {Feature}Config {
  property1: string;
  property2: number;
  property3: boolean;
}

export default registerAs(
  '{feature}',  // Unique namespace
  (): {Feature}Config => ({
    property1: process.env.{FEATURE}_PROPERTY1 || 'default',
    property2: parseInt(process.env.{FEATURE}_PROPERTY2 || '10', 10),
    property3: process.env.{FEATURE}_PROPERTY3 === 'true',
  }),
);
```

### Simple Features (Direct Access)

```typescript
// In your service - no config file needed
@Injectable()
export class SimpleService {
  private readonly maxRetries = parseInt(process.env.SIMPLE_MAX_RETRIES || '3', 10);
  
  // Use directly
}
```

## Environment Variable Naming

### Format: `{FEATURE}_{PROPERTY}`

```bash
# Infrastructure (no prefix)
DB_HOST=localhost
REDIS_PORT=6379

# Feature-specific (with prefix for organization)
USERS_MAX_LOGIN_ATTEMPTS=5
USERS_SESSION_TIMEOUT=3600

PAYMENTS_STRIPE_API_KEY=sk_test_...
PAYMENTS_MAX_REFUND_DAYS=30

NOTIFICATIONS_SMTP_HOST=smtp.example.com
NOTIFICATIONS_SMTP_PORT=587
```

**Tip:** Use prefixes to group related variables, not for strict isolation.

## Register Configuration

### In Feature Module (If Using Config File)

```typescript
// src/features/{feature}/{feature}.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {feature}Config from './config/{feature}.config';

@Module({
  imports: [
    ConfigModule.forFeature({feature}Config),  // Register feature config
  ],
  // ... controllers, providers
})
export class {Feature}Module {}
```

### Skip Registration (For Simple Cases)

```typescript
// No config file needed - just use process.env in service
@Injectable()
export class SimpleService {
  private readonly apiKey = process.env.SIMPLE_API_KEY;
}
```

## Access Configuration

### Type-Safe Access (With Config File)

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { {Feature}Config } from './config/{feature}.config';

@Injectable()
export class {Feature}Service {
  private readonly config: {Feature}Config;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<{Feature}Config>('{feature}')!;
  }

  someMethod() {
    const maxAttempts = this.config.property1;
    const timeout = this.config.property2;
  }
}
```

### Direct Access (Simple Cases)

```typescript
@Injectable()
export class SimpleService {
  private readonly maxRetries = parseInt(
    process.env.SIMPLE_MAX_RETRIES || '3',
    10,
  );

  someMethod() {
    // Use this.maxRetries
  }
}
```

## Configuration with Validation

For critical configuration, add validation:

```typescript
import { registerAs } from '@nestjs/config';
import { IsString, IsInt, Min, Max, IsUrl, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class {Domain}Config {
  @IsString()
  apiKey: string;

  @IsInt()
  @Min(1)
  @Max(100)
  maxRetries: number;

  @IsUrl()
  webhookUrl: string;
}

export default registerAs('{domain}', (): {Domain}Config => {
  const config = plainToClass({Domain}Config, {
    apiKey: process.env.{DOMAIN}_API_KEY || '',
    maxRetries: parseInt(process.env.{DOMAIN}_MAX_RETRIES || '3', 10),
    webhookUrl: process.env.{DOMAIN}_WEBHOOK_URL || '',
  });

  // Validate at startup
  const errors = validateSync(config, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `{Domain} configuration validation failed:\n${errors.map((e) => Object.values(e.constraints || {})).join('\n')}`,
    );
  }

  return config;
});
```

## Type Conversions

```typescript
// String (default)
property: process.env.DOMAIN_PROPERTY || 'default',

// Number
port: parseInt(process.env.DOMAIN_PORT || '3000', 10),

// Boolean
enabled: process.env.DOMAIN_ENABLED === 'true',

// Array (comma-separated)
tags: process.env.DOMAIN_TAGS?.split(',') || [],

// Enum
level: (process.env.DOMAIN_LEVEL as LogLevel) || 'info',
```

## Checklist

- [ ] Assessed if config file is needed (3+ properties?)
- [ ] Created config file with `registerAs` (if needed)
- [ ] Defined TypeScript interface
- [ ] Environment variables have feature prefix
- [ ] Provided sensible defaults
- [ ] Registered with `ConfigModule.forFeature()` (if using config file)
- [ ] Type-safe access in services
- [ ] Added to `.env.example`

## Rules

✅ **DO**:
- Use feature prefixes: `{FEATURE}_PROPERTY`
- Export TypeScript interfaces
- Use `registerAs` for complex config (3+ properties)
- Provide defaults for non-critical config
- Keep it simple - direct `process.env` is fine for 1-2 vars

❌ **DON'T**:
- Over-engineer simple configuration
- Create config files for 1-2 variables
- Forget feature prefixes for clarity
- Put sensitive defaults in code
- Make configuration more complex than needed

## Full Documentation

See `.cursor/rules/configuration.mdc` for complete configuration patterns.
