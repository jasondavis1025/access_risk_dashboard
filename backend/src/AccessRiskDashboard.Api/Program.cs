using AccessRiskDashboard.Api.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// The connection string in appsettings has no password. It is supplied at runtime from
// MSSQL_SA_PASSWORD (environment variable or user-secrets), so credentials stay out of source.
var connectionString = new SqlConnectionStringBuilder(
    builder.Configuration.GetConnectionString("AccessRiskDb")
        ?? throw new InvalidOperationException("Connection string 'AccessRiskDb' is not configured."));
if (builder.Configuration["MSSQL_SA_PASSWORD"] is { Length: > 0 } password)
{
    connectionString.Password = password;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString.ConnectionString));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database", tags: ["ready"]);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Liveness: the API process is up. Does not touch the database.
app.MapHealthChecks("/api/health", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = WriteHealthResponse,
});

// Readiness: the API can reach SQL Server.
app.MapHealthChecks("/api/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteHealthResponse,
});

app.Run();

static Task WriteHealthResponse(HttpContext context, Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report) =>
    context.Response.WriteAsJsonAsync(new
    {
        status = report.Status.ToString(),
        checks = report.Entries.ToDictionary(e => e.Key, e => e.Value.Status.ToString()),
    });
