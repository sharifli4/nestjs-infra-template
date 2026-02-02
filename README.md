# NestJS Infrastructure Template

> Production-ready NestJS infrastructure template with PostgreSQL, Redis, Winston logging, domain-centric architecture, and comprehensive error handling.

## 🚀 Features

### Core Infrastructure

- **NestJS 11.x** - Modern Node.js framework with TypeScript
- **Winston** - Production-grade logging with sensitive data masking (always enabled)
- **Swagger/OpenAPI** - Auto-generated API documentation (always enabled)

### Optional Infrastructure (Enable via .env)

- **MikroORM 6.x** - TypeScript ORM with PostgreSQL support (optional: `USE_DATABASE=true`)
- **Redis** - Distributed caching with IORedis (optional: `USE_REDIS=true`)
- **HashiCorp Vault** - Secret management (optional: `USE_VAULT=true`)

### Architecture

- **Domain-Centric Design** - No shared utility folders, organized by domain
- **Configuration Isolation** - Each domain has its own configuration namespace
- **Comprehensive Exception Handling** - Standardized error responses
- **Base Entities** - Timestamp support and soft delete capabilities

### Code Quality

- **ESLint** - TypeScript linting with recommended rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit linting
- **Jest** - Unit and E2E testing

### Security

- **Global Validation** - class-validator with DTO transformation
- **CORS** - Environment-aware configuration
- **JWT Ready** - Configuration for access and refresh tokens
- **Sensitive Data Masking** - Automatic masking in logs

## 📋 Prerequisites

### Required

- Node.js >= 18.x
- npm or yarn

### Optional (based on your configuration)

- PostgreSQL >= 14.x (if `USE_DATABASE=true`)
- Redis >= 6.x (if `USE_REDIS=true`)
- HashiCorp Vault (if `USE_VAULT=true`)

## 🛠️ Installation

1. **Use this template** (if on GitHub)

   ```bash
   # Click "Use this template" button on GitHub
   # Or clone directly:
   git clone <your-repo-url>
   cd <your-project-name>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Choose your infrastructure:**

   ```bash
   # Minimal setup (Logger + JWT only)
   USE_DATABASE=false
   USE_REDIS=false
   USE_VAULT=false

   # With database
   USE_DATABASE=true
   USE_REDIS=false
   USE_VAULT=false

   # Full stack (database + caching + vault)
   USE_DATABASE=true
   USE_REDIS=true
   USE_VAULT=true
   ```

4. **Start infrastructure services** (only if enabled in .env)

   If `USE_DATABASE=true`:

   ```bash
   docker run -d --name postgres \
     -e POSTGRES_DB=project_db \
     -e POSTGRES_USER=project_user \
     -e POSTGRES_PASSWORD=superpassword \
     -p 5432:5432 \
     postgres:14
   ```

   If `USE_REDIS=true`:

   ```bash
   docker run -d --name redis \
     -p 6379:6379 \
     redis:6
   ```

5. **Start the application**

   ```bash
   # Development mode with hot-reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the application**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/docs

## 📁 Project Structure

```
nestjs-infra-template/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── config/                      # Infrastructure configuration
│   │   ├── env.ts                   # Environment variables
│   │   ├── database.config.ts       # Database config
│   │   ├── redis.config.ts          # Redis config
│   │   ├── logger.config.ts         # Logger config
│   │   └── jwt.config.ts            # JWT config
│   │
│   ├── core/                        # Core domain modules
│   │   └── exceptions/              # Exception handling system
│   │       ├── exception-type.enum.ts
│   │       ├── base-exception.dto.ts
│   │       ├── http/                # HTTP exceptions
│   │       ├── database/            # Database exceptions
│   │       ├── decorators/          # Swagger decorators
│   │       ├── utils/               # Exception utilities
│   │       └── index.ts             # Barrel exports
│   │
│   ├── database/                    # Database base entities
│   │   ├── base.entity.ts           # Timestamps
│   │   └── soft-deletable.entity.ts # Soft deletes
│   │
│   ├── logger/                      # Logging infrastructure
│   │   ├── logger.service.ts        # Winston logger
│   │   ├── logger.interceptor.ts    # Request/response logging
│   │   ├── logger.filter.ts         # Exception logging
│   │   └── logger.module.ts         # Logger module
│   │
│   ├── redis/                       # Redis caching
│   │   ├── redis.service.ts         # Redis client wrapper
│   │   └── redis.module.ts          # Redis module
│   │
│   ├── vault/                       # Secret management
│   │   └── vault.loader.ts          # Vault integration
│   │
│   └── features/                    # Feature modules (add your domains here)
│
├── test/                            # E2E tests
├── .env.example                     # Environment template
├── .husky/                          # Git hooks
├── spec.md                          # Full specification
└── package.json
```

## 🏗️ Domain-Centric Architecture

This template follows a domain-centric approach:

### ✅ DO: Organize by Domain

```
src/
├── features/
│   ├── users/
│   │   ├── config/
│   │   │   └── users.config.ts      # Domain-specific config
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── notifications/
│   │   ├── config/
│   │   │   └── notifications.config.ts
│   │   └── ...
```

### ❌ DON'T: Use Utility/Common Folders

- No `src/common/` or `src/utils/`
- Core infrastructure belongs in `src/core/` (exceptions, guards, etc.)
- Domain-specific logic stays in the domain

## ⚙️ Configuration Management

### Optional Infrastructure Features

The template supports three optional infrastructure components that you can enable/disable via environment variables:

```bash
# .env configuration
USE_DATABASE=true   # Enable PostgreSQL with MikroORM
USE_REDIS=true      # Enable Redis caching
USE_VAULT=true      # Enable HashiCorp Vault for secrets
```

**Benefits:**

- ✅ Start minimal and add features as needed
- ✅ Reduce dependencies for simple projects
- ✅ Faster startup and lower resource usage
- ✅ Pay for what you use

**Common Configurations:**

| Use Case             | Database | Redis | Vault | Description                       |
| -------------------- | -------- | ----- | ----- | --------------------------------- |
| **Minimal API**      | ❌       | ❌    | ❌    | Stateless API with external auth  |
| **Standard App**     | ✅       | ❌    | ❌    | Database-driven application       |
| **High Performance** | ✅       | ✅    | ❌    | With caching layer                |
| **Production**       | ✅       | ✅    | ✅    | Full stack with secret management |

### Configuration Isolation

Each domain has its own configuration namespace:

```typescript
// src/features/users/config/users.config.ts
export default registerAs('users', () => ({
  hashIdSalt: process.env.USERS_HASHID_SALT,
  maxLoginAttempts: parseInt(process.env.USERS_MAX_LOGIN_ATTEMPTS || '5'),
}));

// src/features/users/users.service.ts
constructor(private configService: ConfigService) {
  // ✅ Access only your domain's config
  const config = this.configService.get<UsersConfig>('users');

  // ❌ Cannot access other domain configs
  // const notifConfig = this.configService.get<NotificationsConfig>('notifications');
}
```

### Environment Variables Naming

Use domain prefixes:

```bash
# Infrastructure (global)
DB_HOST=localhost
REDIS_PORT=6379

# Domain-specific (prefixed)
USERS_HASHID_SALT=unique-salt
NOTIFICATIONS_SMTP_HOST=smtp.example.com
PAYMENTS_STRIPE_API_KEY=sk_test_...
```

## 🔒 Exception Handling

### Standard Exception Response

All exceptions return a consistent format:

```json
{
  "status": 400,
  "message": "bad request error(s) in email",
  "code": "BAD_REQUEST",
  "target": ["email"],
  "timestamp": "2026-02-02T10:30:00.000Z",
  "type": "VALIDATION",
  "detail": "Email format is invalid"
}
```

### Using Exceptions

```typescript
import {
  CustomBadRequestException,
  NotFoundException,
  ExceptionTypeEnum,
} from '@/core/exceptions';

// Validation error
throw new CustomBadRequestException(
  ['email'],
  ExceptionTypeEnum.VALIDATION,
  'Email format is invalid',
);

// Not found error
throw new NotFoundException('User', userId);

// Database error handling
try {
  await this.userRepository.persistAndFlush(user);
} catch (error) {
  if (error.code === '23505') {
    throw new CustomBadRequestException(
      ['email'],
      ExceptionTypeEnum.UNIQUE_VIOLATION,
      'Email already exists',
    );
  }
  throw new DatabaseOperationException(error, 'createUser');
}
```

### Swagger Documentation

```typescript
import { ApiCustomExceptionResponse } from '@/core/exceptions';

@Controller('users')
export class UsersController {
  @Post()
  @ApiCustomExceptionResponse(400, 'Invalid user data')
  @ApiCustomExceptionResponse(409, 'Email already exists')
  async createUser(@Body() dto: CreateUserDto) {
    // Implementation
  }
}
```

## 🗃️ Database (Optional)

Enable with `USE_DATABASE=true` in your `.env` file.

### Base Entities

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '@/database/base.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  email!: string;

  // createdAt and updatedAt are automatically included from BaseEntity
}
```

### Soft Deletes

```typescript
import { SoftDeletableEntity } from '@/database/soft-deletable.entity';

@Entity()
export class Post extends SoftDeletableEntity {
  // deletedAt field is automatically included
}
```

## 📝 Logging (Always Enabled)

The logging system is always enabled as it's core infrastructure.

### Logger Service

```typescript
import { CustomLoggerService } from '@/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(private logger: CustomLoggerService) {}

  async create(dto: CreateUserDto) {
    this.logger.log('Creating user', { email: dto.email });
    // Sensitive fields like 'password' are automatically masked
  }
}
```

### Features

- **Automatic Request/Response Logging** - Via interceptor
- **Exception Logging** - Via exception filter
- **Correlation IDs** - Request tracking
- **Sensitive Data Masking** - Passwords, tokens, etc.
- **Configurable Formats** - JSON for production, pretty for development

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🔐 Secret Management (Optional)

Enable with `USE_VAULT=true` in your `.env` file.

### Using .env (Development)

```bash
USE_VAULT=false
DB_PASSWORD=superpassword
JWT_ACCESS_TOKEN_SECRET=secret
```

### Using HashiCorp Vault (Production)

```bash
USE_VAULT=true
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=your-token
SECRET_PATH=project-name
MOUNT_PATH=secret
```

Secrets are automatically loaded from Vault at startup.

## 📦 Available Scripts

```bash
npm run start           # Start application
npm run start:dev       # Start with hot-reload
npm run start:prod      # Start in production mode
npm run build           # Build for production
npm run format          # Format code with Prettier
npm run lint            # Lint and fix with ESLint
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:cov        # Generate coverage report
```

## 🚢 Deployment

### Environment Configuration

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
USE_VAULT=true
DB_SSL=true
DB_USE_CONNECTION_POOLER=true
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Health Check

The application includes comprehensive health check endpoints:

```bash
# Main health check - shows service status
GET /health
Response: {
  "status": "ok",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "services": {
    "database": "enabled",
    "redis": "enabled"
  }
}

# Kubernetes readiness probe
GET /health/ready

# Kubernetes liveness probe
GET /health/live
```

All health check endpoints are documented in Swagger at `/docs`.

## 🤝 Contributing

When using this template:

1. **Remove template-specific files** before your first commit
2. **Update package.json** with your project details
3. **Update this README** with project-specific information
4. **Configure environment variables** for your infrastructure

## 🤖 AI Agent Support

This template includes **universal [Agent Skills](https://agentskills.io)** that work across all compatible AI coding agents (Claude Code, Cursor, Windsurf, Cline, Zed, etc.).

### Available Skills

- **nestjs-template-architecture** - Understand project structure and organization
- **create-nestjs-feature** - Create complete feature modules
- **create-nestjs-exception** - Create standardized exceptions
- **create-nestjs-config** - Create feature configuration

See [skills/README.md](./skills/README.md) for details.

---

## 📚 Documentation

For detailed information, see:

- [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md) - How to organize your code (infrastructure vs features)
- [spec.md](./spec.md) - Complete project specification
- [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) - Design patterns explained (Factory, Builder, Strategy)
- [OPTIONAL_FEATURES.md](./OPTIONAL_FEATURES.md) - Optional infrastructure setup guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation details and summary
- [CHANGELOG_GUIDE.md](./CHANGELOG_GUIDE.md) - Changelog generation and conventional commits
- [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) - CI/CD workflows and deployment automation

### 🚀 CI/CD & DevOps

This template includes comprehensive GitHub Actions workflows:

**Continuous Integration:**

- ✅ Automated linting and formatting checks
- ✅ Unit and E2E tests on multiple Node.js versions
- ✅ Build validation
- ✅ Code coverage reporting (Codecov)
- ✅ Conventional commit validation

**Automated Releases:**

- ✅ Automatic changelog generation on merge to main
- ✅ Semantic versioning based on commit messages
- ✅ Git tags and GitHub releases

**Security & Quality:**

- ✅ CodeQL security analysis
- ✅ Dependency vulnerability scanning
- ✅ Dependabot for automated updates

**Docker Support:**

- ✅ Multi-stage optimized builds
- ✅ Automatic image publishing to GitHub Container Registry
- ✅ Health check integration

See [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) for detailed setup and configuration.

### 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t nestjs-template .

# Run container
docker run -p 3000:3000 --env-file .env nestjs-template

# Pull from GitHub Container Registry (after setup)
docker pull ghcr.io/your-org/your-repo:latest
```

External resources:

- NestJS Docs: https://docs.nestjs.com
- MikroORM Docs: https://mikro-orm.io
- Conventional Commits: https://www.conventionalcommits.org
- GitHub Actions: https://docs.github.com/en/actions

## 📄 License

UNLICENSED - This is a template. Choose your own license.

---

**Made with ❤️ for production-ready NestJS applications**
