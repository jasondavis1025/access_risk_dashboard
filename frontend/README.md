# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Demo authentication (mock)

> **Not real security.** Signup and login are simulated in the browser. No account is created,
> nothing is stored or sent over the network, and the master password is never read by the mock.

Routes: `/signup`, `/login`, and `/vault` (placeholder). The session lives in memory only, so
logging out or reloading the page signs you out.

`MockAuthService` (`src/app/auth/mock-auth.service.ts`) waits 800 ms per call, then decides the
outcome from the email address alone (case-insensitive). Any password that passes the form
validation works.

| Email | Signup | Login |
| --- | --- | --- |
| `taken@example.com` | Rejected: "An account with this email already exists." | Succeeds |
| `wrong@example.com` | Succeeds | Rejected: "Email or master password is incorrect." |
| `offline@example.com` | Rejected: service unavailable | Rejected: service unavailable |
| Any other valid email | Succeeds, opens `/vault` | Succeeds, opens `/vault` |

Form rules: valid email (max 254 characters). Signup requires a 12–128 character master password
and a matching confirmation. Login only requires both fields.

### Replacing the mock

Components and guards depend only on the abstract `AuthService` (`src/app/auth/auth.service.ts`).
To connect the real API, write another class that extends `AuthService` and swap it in
`src/app/app.config.ts`:

```ts
{ provide: AuthService, useClass: MockAuthService }, // → your HTTP implementation
```

Methods must resolve with an `AuthSession` or reject with an `AuthError` whose `code` is
`invalid-credentials`, `email-taken`, or `unavailable`. The UI shows `AuthError.message` as-is.

`authGuard` and `guestGuard` (`src/app/auth/auth.guards.ts`) only control navigation in the
browser. They are not a security boundary; the backend must authorize every request.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
