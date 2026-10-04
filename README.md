# Access Risk Dashboard

Development scaffold. Features are built incrementally on top of this setup.

| Path | Contents |
| --- | --- |
| `frontend/` | Angular 22 + Angular Material placeholder app |
| `backend/` | ASP.NET Core 10 API with health endpoints and EF Core (SQL Server) |
| `collector/` | Python 3.13 package scaffold |
| `docker-compose.yml` | SQL Server 2022 Developer edition with a persistent volume |

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24 LTS (`^24.15.0`, see `frontend/.nvmrc`) | Required by Angular 22 |
| .NET SDK | 10.0.401+ (see `global.json`) | |
| Python | 3.13 | Windows: `py -3.13` |
| Docker | Docker Desktop with Compose v2+ | |

## First-time setup

```powershell
# 1. Local secrets (never committed)
Copy-Item .env.example .env
#    Edit .env and set a strong MSSQL_SA_PASSWORD.

# 2. Give the backend the same password via user-secrets (stored outside the repo)
dotnet user-secrets set MSSQL_SA_PASSWORD "<same password as .env>" --project backend/src/AccessRiskDashboard.Api

# 3. Install dependencies from lockfiles
cd frontend; npm ci; cd ..
dotnet restore backend/AccessRiskDashboard.slnx --locked-mode
dotnet tool restore --tool-manifest backend/dotnet-tools.json
```

Collector venv setup is described in [collector/README.md](collector/README.md).

## Run

```powershell
# SQL Server (waits until healthy, then creates the empty AccessRiskDashboard database)
docker compose up -d

# API: http://localhost:5080
dotnet run --project backend/src/AccessRiskDashboard.Api

# Frontend: http://localhost:4200 (proxies /api to the backend)
cd frontend; npm start
```

Stop SQL Server with `docker compose down`. Data persists in the `access-risk-dashboard_mssql-data`
volume. Run `docker compose down -v` to delete it.

## Local URLs

| URL | Purpose |
| --- | --- |
| http://localhost:4200 | Angular app |
| http://localhost:5080/api/health | API liveness (no DB check) |
| http://localhost:5080/api/health/ready | API readiness (includes SQL Server check) |
| http://localhost:5080/openapi/v1.json | OpenAPI document (Development only) |
| `127.0.0.1,1433` | SQL Server (user `sa`, password from `.env`) |

## Configuration

- **Backend → SQL Server:** `ConnectionStrings:AccessRiskDb` in `appsettings.json` has no password.
  The API injects `MSSQL_SA_PASSWORD` from user-secrets or an environment variable at startup.
  The server address is `127.0.0.1`, not `localhost`, because Docker binds IPv4 only and
  `localhost` can resolve to `::1` first, which stalls until the connect timeout.
- **Frontend → API:** `frontend/proxy.conf.json` forwards `/api/*` from the dev server to
  `http://localhost:5080`, so the app calls relative `/api/...` URLs without CORS.

## Lockfiles

- `frontend/package-lock.json` (npm, exact versions in `package.json`)
- `backend/src/AccessRiskDashboard.Api/packages.lock.json` (NuGet)
- `collector/pylock.toml` (PEP 751)

## Checks

```powershell
cd frontend; npm run build; npm test -- --watch=false; cd ..
dotnet build backend/AccessRiskDashboard.slnx
collector/.venv/Scripts/python -m pytest collector
```
