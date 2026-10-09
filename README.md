# node-clean-architecture

A Node.js and TypeScript service template following Clean Architecture: business rules in a domain layer, use cases in an application layer, and frameworks and storage kept at the edges. It uses the vocabulary most developers already know (entities, use cases, repositories) and keeps the ceremony to a minimum.

It ships with one example module, `tasks`, that shows every layer working end to end over HTTP. Copy its structure for new modules and replace its domain.

## Getting started

Requires Node.js 24 or later.

```bash
npm install
npm run dev
```

The service listens on port 3000 by default.

| Variable    | Default | Description                                                           |
| ----------- | ------- | --------------------------------------------------------------------- |
| `LOG_LEVEL` | `info`  | One of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |
| `PORT`      | `3000`  | Port the HTTP server listens on                                       |

## Scripts

| Script                  | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run build`         | Compile `src` to `dist`, excluding tests              |
| `npm run dev`           | Run from source, restart on change, pretty-print logs |
| `npm run format`        | Format all files with Prettier                        |
| `npm run format:check`  | Check formatting without writing                      |
| `npm run lint`          | Lint all files                                        |
| `npm run lint:fix`      | Lint and apply automatic fixes                        |
| `npm start`             | Run the compiled build                                |
| `npm test`              | Run the tests once                                    |
| `npm run test:coverage` | Run the tests and enforce the 80% coverage minimum    |
| `npm run test:watch`    | Run the tests in watch mode                           |
| `npm run typecheck`     | Type-check without emitting                           |

## Architecture

```
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
        │   └── repositories/  # repository interfaces
        ├── application/
        │   ├── errors/        # use-case outcomes, such as "not found"
        │   └── use-cases/     # one per file
        ├── infrastructure/
        │   └── database/      # the in-memory repository
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

The domain and application layers never import Express, a database client or any other framework. That is what lets you swap the in-memory repository for a real database, or call a use case without HTTP, without touching business logic. If you know Ports and Adapters (hexagonal architecture), repository interfaces are the ports and infrastructure and presentation hold the adapters.

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

Tests use [Vitest](https://vitest.dev) and [supertest](https://github.com/forwardemail/supertest), and live next to the file they test.

| Layer          | What the tests cover                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Domain         | Business rules, including boundary values                                                          |
| Application    | Each use case against the in-memory repository                                                     |
| Infrastructure | Each repository implementation's behaviour                                                         |
| Presentation   | Each controller with a stubbed use case (validation and error statuses), and the router end to end |
| App            | Health check, routing, 404, malformed JSON and unexpected errors                                   |

Controller tests mount the controller through `makeApp`, so they run with the same middleware as the real service.

## Notes

**TypeScript is pinned to 6.0** because `typescript-eslint` does not support TypeScript 7 yet. Upgrade once it does.

## License

[MIT](LICENSE)
