using AccessRiskDashboard.Api.Data;
using AccessRiskDashboard.Api.Models;
using Dapper;

namespace AccessRiskDashboard.Api.Repositories;

public sealed class UserRepository
{
    private readonly SqlConnectionFactory _connectionFactory;

    public UserRepository(SqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection(); //using disposes of the connection when the method exits.

        //Three quotes start and end a C# raw string literal. It lets us write SQL across multiple lines without special escaping.
        const string sql = """
            SELECT Id, Email, CreatedAtUtc
            FROM dbo.Users
            WHERE Email = @Email;
            """;

        return await connection.QuerySingleOrDefaultAsync<User>( //QuerySingleOrDefaultAsync<T>() comes from Dapper. executes the SQL and maps the result to a User object.
            sql,
            new { Email = email });
    }
}
