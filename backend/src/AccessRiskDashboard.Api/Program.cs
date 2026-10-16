using System.ComponentModel.DataAnnotations;
using AccessRiskDashboard.Api.Contracts;
using AccessRiskDashboard.Api.Data;
using AccessRiskDashboard.Api.HealthChecks;
using AccessRiskDashboard.Api.Models;
using AccessRiskDashboard.Api.Repositories;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Data.SqlClient;

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

var connectionFactory = new SqlConnectionFactory(connectionString.ConnectionString);

builder.Services.AddSingleton(connectionFactory); //safe to do singleton because SqlConnectionFactory is stateless. it just holds the connection string and creates new SqlConnection objects when requested.

builder.Services.AddScoped<UserRepository>(); //scoped lifetime is appropriate for repositories that use a DbContext or SqlConnection, because they are not thread-safe and should be disposed of after each request.



builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Temporary development endpoint for testing the repository.
    app.MapGet("/api/dev/users/by-email", async (
        string email,
        UserRepository userRepository) =>
    {
        // ASP.NET Core supplies the registered repository.
        var user = await userRepository.GetByEmailAsync(email);

        if (user is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(user);
    });

    app.MapPost("/api/dev/users", async (
    CreateUserRequest request,
    UserRepository userRepository) =>
    {
        // Reject null, empty, or whitespace-only email values.
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { message = "Email is required." });
        }

        var email = request.Email.Trim(); // Remove leading and trailing whitespace.

        // Reject values longer than our database column supports.
        if (email.Length > 254)
        {
            return Results.BadRequest(new { message = "Email is too long." });
        }

        var emailValidator = new EmailAddressAttribute(); // Create .NET's email-format validator.

        if (!emailValidator.IsValid(email)) // Check the format, not whether the mailbox exists.
        {
            return Results.BadRequest(new { message = "Enter a valid email address." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            CreatedAtUtc = DateTime.UtcNow
        };

        try
        {
            await userRepository.CreateAsync(user); // Attempt the insert.

            return Results.Ok(user); // Return the created record.
        }
        catch (SqlException exception) when (
            exception.Number == 2601 || exception.Number == 2627)
        {
            // SQL Server rejected a duplicate unique-index or constraint value.
            return Results.Conflict(new
            {
                message = "An account with this email already exists."
            });
        }

    });

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
