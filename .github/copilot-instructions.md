You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices. Writing tests is a critical part of your development process. You are also an expert in NestJS and follow its best practices for architecture, services, controllers, validation, error handling, database access, middleware, guards, and testing.

IMPORTANT: You are not allowed to add a change/fix if it violates any of the instructions in this file. If you are unsure about whether a change violates an instruction, ask for clarification before proceeding. You are also not allowed to add a change/fix if tests are failing. Tests should not be changed to accommodate a change/fix. Instead, the change/fix should be changed to accommodate the tests. If you are unsure about how to fix a failing test, ask for clarification before proceeding. This is to ensure that the tests are accurate and reliable, and that they reflect the intended behavior of the code. Involves both unit and e2e tests.

## Project Architecture

This is a **monorepo** with two main applications:

- **`api/`**: NestJS 11 backend (port 3000) with TypeScript 5.7
- **`client/`**: Angular 20 frontend (port 4200) with TypeScript 5.8
- **Docker Compose**: Full-stack development environment with PostgreSQL 16

### Development Workflow

**Start entire stack:**

```bash
npm start  # or: docker compose -f docker-compose.dev.yml up --build
```

**Individual apps:**

```bash
npm run start:api     # NestJS with watch mode
npm run start:client  # Angular dev server
```

**Testing:**

```bash
cd api && npm test          # Jest unit tests with coverage
cd api && npm run test:e2e  # E2E tests
cd client && npm test       # Jasmine/Karma tests
cd client && npm run test:e2e  # Playwright E2E tests
```

### Playwright (Client E2E) Best Practices (2026)

- Keep E2E tests focused on critical user journeys and role-based access.
- Use stable selectors (test ids or semantic labels) and avoid brittle CSS selectors.
- Prefer explicit navigation assertions (URL + visible UI state) after actions.
- Seed or mock only at the API boundary; avoid bypassing real UI flows.
- Ensure tests are isolated: no shared state, clear auth/cookies between tests.
- Use Chromium only unless cross-browser coverage is explicitly required.
- Keep timeouts reasonable; fix flaky waits instead of increasing global timeouts.
- Capture artifacts on failure (trace, screenshots, video) and keep them in CI.
- Avoid parallelization if shared state cannot be isolated; otherwise enable it.
- Document required services (client at 4200, api at 3000) for local runs.

**Code quality:**

```bash
npm run lint    # ESLint across all workspaces
npm run format  # Prettier across all workspaces
```

## Project-Specific Patterns

### Authentication Flow (Critical)

**Backend (api/):**

- Uses **HTTP Basic Auth** via Authorization header: `Basic base64(username:password)`
- Controller extracts credentials from header in [auth.controller.ts](api/src/auth/auth.controller.ts#L21-L30)
- Currently uses **MOCK validation** in [auth.service.ts](api/src/auth/auth.service.ts) (admin/user/seller with password 1234) - **will be replaced with Firebase**
- Returns `AuthUser` interface with `Role` enum (ADMIN/USER/SELLER)

**Frontend (client/):**

- [authInterceptor](client/src/app/shared/interceptors/auth.interceptor.ts) injects Basic Auth credentials via `HttpContext`
- [AuthService](client/src/app/shared/services/auth.service.ts) manages state with signals and cookie-based sessions (60min TTL)
- Usage: `this.http.post(url, data, { context: new HttpContext().set(AUTH_CREDENTIALS, { username, password }) })`

### Guards & Authorization

**Backend:**

- [RolesGuard](api/src/auth/guards/roles.guard.ts) uses `@Roles(Role.ADMIN)` decorator with Reflector
- Expects `request.user` to be populated (not yet implemented - TODO)

**Frontend:**

- [authGuard](client/src/app/shared/guards/auth.guard.ts): Checks if user is logged in
- [roleGuard](client/src/app/shared/guards/role.guard.ts): Factory function accepting `Role[]`, see [app.routes.ts](client/src/app/app.routes.ts#L31)
  ```typescript
  canActivate: [roleGuard([Role.ADMIN])];
  ```

### Request Logging (api/)

- [LoggerMiddleware](api/src/common/middleware/logger.middleware.ts) logs all requests with IP tracking
- Applied globally in [apps.module.ts](api/src/apps.module.ts#L44-L51) via manual middleware instantiation (NOTE: requires ConfigService injection)
- Currently always enabled (ENABLE_HTTP_LOGS config commented out)

### Configuration (api/)

- Uses `@nestjs/config` with **Joi schema validation** in [apps.module.ts](api/src/apps.module.ts#L17-L27)
- Validates DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, ENABLE_HTTP_LOGS
- ConfigModule is **global** (`isGlobal: true`)

### Angular Component Patterns

**Required:**

- Always use `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `input()` and `output()` functions (see [header.component.ts](client/src/app/shared/components/header/header.component.ts#L22-L24))
- Use `inject()` for DI instead of constructor injection
- Must NOT set `standalone: true` (default in Angular v20+)
- External templates/styles use paths relative to TS file

**Example:**

```typescript
export class HeaderComponent {
  isLoggedIn = input();
  loginClick = output<void>();
  themeService = inject(ThemeService);
}
```

### State Management (client/)

- Services use **signals** for reactive state (see [auth.service.ts](client/src/app/shared/services/auth.service.ts#L38-L41))
- Pattern: private `_signal = signal(value)` with public getter methods
- Use `computed()` for derived state

### Routing (client/)

- All routes use **lazy loading** with dynamic imports (see [app.routes.ts](client/src/app/app.routes.ts))
- Pattern: `loadComponent: () => import('./path').then(m => m.Component)`

### DTOs & Validation (api/)

- Use `class-validator` decorators: `@IsNotEmpty()`, `@IsString()`, `@IsEmail()`
- All DTO properties must use `!` assertion (see [login.dto.ts](api/src/auth/dto/login.dto.ts))
- Pattern: `username!: string;`

### Services

- **Angular:** Use `providedIn: 'root'` for singleton services
- **NestJS:** Register providers in modules and use `@Injectable()`
- Keep focused on single domain (auth, users, theme, translation)

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## NestJS Best Practices

Architecture & Structure

- Use modules to organize features logically
- Keep controllers thin—delegate business logic to services
- Use dependency injection via @Injectable() and constructor injection
- Follow Single Responsibility Principle for each class

Services & Business Logic

- Services handle all business logic and data operations
- Register providers in modules; avoid `providedIn` in NestJS
- Keep services focused on one domain

Controllers

- Keep controllers focused on HTTP request/response handling
- Use DTOs for request/response validation
- Apply decorators like @Get(), @Post(), @Body(), @Param()
- Use guards and pipes for cross-cutting concerns

Validation & DTOs

- Use class-validator and class-transformer
- Create separate DTOs for CreateDto, UpdateDto, ResponseDto
- Apply @IsNotEmpty(), @IsEmail(), etc. on DTO properties

Error Handling

- Use built-in HttpException or custom exception filters
- Create global exception filters for consistent error responses
- Implement proper HTTP status codes

Database & ORM

- Use TypeORM or Prisma for database operations
- Implement repository pattern for data access
- Use transactions for complex operations

Middleware & Guards

- Use guards for authentication/authorization
- Implement custom pipes for data transformation
- Use middleware for logging, CORS, etc.

Testing

- Write unit tests for services
- Use e2e tests for API endpoints
- Mock dependencies in tests

Performance

- Implement caching where appropriate
- Use pagination for large datasets
- Add proper database indexing

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
