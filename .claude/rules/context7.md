# Documentation lookups (Context7)

The Context7 MCP server is installed. Whenever a question or task involves an external framework,
API, or library (for example Angular, Angular Material, RxJS, ASP.NET Core, EF Core, SQL Server,
Python packages), always use the Context7 tools to get current documentation instead of relying on
training data, which may be out of date:

1. `resolve-library-id` to find the Context7 library ID.
2. `query-docs` with that ID to fetch the relevant, version-specific documentation.

Match the versions this project uses (see README.md). If Context7 is unavailable or has no entry
for the library, say so and fall back to the official documentation.
