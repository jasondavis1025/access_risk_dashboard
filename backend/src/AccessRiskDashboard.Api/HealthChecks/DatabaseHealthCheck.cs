using AccessRiskDashboard.Api.Data; // Makes our SqlConnectionFactory class available.
using Microsoft.Extensions.Diagnostics.HealthChecks; // Provides the health-check interface and result types.

namespace AccessRiskDashboard.Api.HealthChecks;

public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly SqlConnectionFactory _connectionFactory;

    public DatabaseHealthCheck(SqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, // Receives information about this check; we don't use it yet.
        CancellationToken cancellationToken = default) // Allows the operation to be cancelled.
    {
        using var connection = _connectionFactory.CreateConnection(); // Creates an unopened connection; using ensures disposal when the method exits.

        await connection.OpenAsync(cancellationToken); // Attempts to connect; waits asynchronously for completion.

        return HealthCheckResult.Healthy(); // Reports success if opening the connection completed without an exception.
    }
}
