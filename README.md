# node-clean-architecture

A Node.js and TypeScript service template following Clean Architecture: business rules in a domain layer, use cases in an application layer, and frameworks and storage kept at the edges. It uses the vocabulary most developers already know (entities, use cases, repositories) and keeps the ceremony to a minimum.

It ships with one example module, `tasks`, that shows every layer working end to end over HTTP. Copy its structure for new modules and replace its domain.

## Getting started

Requires Node.js 24 or later and Docker.

```bash
npm install
cp .env.example .env
npm run db:start
npm run migrate up
npm run dev
```

`db:start` runs Postgres 18 in Docker on port 5432. The service listens on port 3000 by default.

| Variable       | Default  | Description                                                           |
| -------------- | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | Required | Postgres connection string                                            |
| `LOG_LEVEL`    | `info`   | One of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |
| `PORT`         | `3000`   | Port the HTTP server listens on                                       |

`npm run dev` and `npm run migrate` read `.env`; in production, set the variables in the environment.

## Scripts

| Script                     | Description                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`            | Compile `src` to `dist`, excluding tests                                                                                                     |
| `npm run db:start`         | Start Postgres in Docker and wait until it's ready                                                                                           |
| `npm run dev`              | Run from source, restart on change, pretty-print logs                                                                                        |
| `npm run format`           | Format all files with Prettier                                                                                                               |
| `npm run format:check`     | Check formatting without writing                                                                                                             |
| `npm run lint`             | Lint all files                                                                                                                               |
| `npm run lint:fix`         | Lint and apply automatic fixes                                                                                                               |
| `npm run migrate`          | Run [node-pg-migrate](https://salsita.github.io/node-pg-migrate/), such as `npm run migrate up` or `npm run migrate -- create <name> -j sql` |
| `npm start`                | Run the compiled build                                                                                                                       |
| `npm test`                 | Run the unit tests once                                                                                                                      |
| `npm run test:coverage`    | Run all tests and enforce the 80% coverage minimum                                                                                           |
| `npm run test:integration` | Run the integration tests against Postgres in Docker                                                                                         |
| `npm run test:watch`       | Run the unit tests in watch mode                                                                                                             |
| `npm run typecheck`        | Type-check without emitting                                                                                                                  |

## Architecture

```
migrations/                    # SQL migrations, run by node-pg-migrate
src/
├── main.ts                    # composition root: builds repositories, use cases and routers, starts the server
├── app.ts                     # Express app: request logging, JSON parsing, /health, routers, 404, error handler
├── config.ts                  # environment variables, validated with Zod
├── shared/
│   └── result.ts              # Result, ok(), err()
└── modules/
    └── tasks/                 # an example module
        ├── domain/
        │   ├── entities/      # entities and their business rules
        │   ├── errors/        # broken business rules
        │   └── repositories/  # repository interfaces, with their contract tests
        ├── application/
        │   ├── errors/        # use-case outcomes, such as "not found"
        │   └── use-cases/     # one per file
        ├── infrastructure/
        │   └── database/      # the Postgres repository, and an in-memory one for tests
        └── presentation/
            ├── controllers/   # one per use case: validate the request, call the use case, map the result to HTTP
            ├── dtos/          # the public JSON shapes, and functions that map entities to them
            └── tasks-router.ts # the module's routes
```

Dependencies point inward:

- **Domain** depends on nothing but `shared/`.
- **Application** depends on the domain.
- **Infrastructure** implements the domain's repository interfaces.
- **Presentation** calls use cases and maps their results to HTTP.

The domain and application layers never import Express, a database client or any other framework. That is what lets the service run on Postgres while the use case tests run on an in-memory repository, or a use case run without HTTP, without touching business logic. If you know Ports and Adapters (hexagonal architecture), repository interfaces are the ports and infrastructure and presentation hold the adapters.

## Conventions

- **Expected failures are returned, not thrown.** Domain rules and use cases return a `Result`, with failures as `Error` subclasses passed to `err()`. Anything thrown is unexpected and becomes a logged 500.
- **Each error lives where it arises,** one class per file: broken business rules in the domain (`InvalidTaskTitleError`), use-case outcomes in the application layer (`TaskNotFoundError`). Each has a `code` such as `TASK_NOT_FOUND` to match on.
- **Use cases take a command or query object,** such as `CreateTaskCommand` or `GetTaskQuery`: commands change state and queries read it. Each use case exports its input, function type and error union, such as `CreateTask` and `CreateTaskError`, so controllers depend on types rather than implementations.
- **Controllers validate the whole request with Zod** and return a 400 with the issues when it doesn't match.
- **Controllers map error codes to statuses** with a `Record` of every code the use case can return, so a new error doesn't compile until it has a status.
- **Responses are mapped explicitly** to DTOs, through functions such as `toTaskDto`, so domain changes don't reach clients by accident.
- **Factories are called `make…`** and take a `…Dependencies` object.
- **Files are named after what they hold,** in kebab case: `create-task.ts` holds the create-task use case, and `task-not-found-error.ts` holds `TaskNotFoundError`. Test blocks are named after the function under test, such as `makeCreateTask`.
- **Names are singular for a kind of thing and plural for a collection:** `Task`, `TaskRepository` and `TaskNotFoundError`, but the `tasks/` module, the `/tasks` path and `tasksRouter`.

## Testing

Tests use [Vitest](https://vitest.dev), [supertest](https://github.com/forwardemail/supertest) and [Testcontainers](https://node.testcontainers.org), and live next to the file they test.

**A test is an integration test if it needs something outside the Node.js process, such as a database; everything else is a unit test.** That includes the supertest controller and router tests: they run the app in memory, with stubbed or in-memory dependencies. The two kinds run as separate Vitest projects:

- **Unit** (`*.test.ts`) runs in memory in under a second, with no setup. `npm test` runs these.
- **Integration** (`*.integration.test.ts`) runs against a real Postgres. Testcontainers starts a throwaway container once per run and applies the migrations, and each test starts from empty tables. Test files share the database, so they run one at a time. Docker must be running.

| Layer          | What the tests cover                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Domain         | Business rules, including boundary values                                                          |
| Application    | Each use case against the in-memory repository                                                     |
| Infrastructure | Each repository implementation, against one shared contract                                        |
| Presentation   | Each controller with a stubbed use case (validation and error statuses), and the router end to end |
| App            | Health check, routing, 404, malformed JSON and unexpected errors                                   |

Every repository implementation runs the same tests from `domain/repositories/task-repository.contract.ts`, which sits next to the interface it describes, so the in-memory repository the use case tests rely on is proven to behave like the Postgres one. These are contract tests in the sense of checking a fake against the real thing, not consumer-driven contract tests like Pact. Controller tests mount the controller through `makeApp`, so they run with the same middleware as the real service.

`npm run test:coverage` runs both projects, so it needs Docker: unit tests alone don't cover the Postgres repository. `vitest.global-setup.ts`, next to the Vitest config that uses it, starts Postgres for the integration tests. It sits outside `src/`, so it is never built or counted in coverage. Test-only files inside `src/`, such as `*.contract.ts`, are excluded from the build in `tsconfig.build.json` and from coverage in `vitest.config.js`; a new kind needs adding to both.

Tests of the whole running service against real infrastructure, if you add them, belong in a top-level `test/` folder as their own Vitest project, since they test no single file.

## Notes

**TypeScript is pinned to 6.0** because `typescript-eslint` does not support TypeScript 7 yet. Upgrade once it does.

## License

[MIT](LICENSE)
