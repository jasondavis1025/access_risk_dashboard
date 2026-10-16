using System.Reflection; // Provides Assembly, used to locate embedded SQL scripts.
using DbUp; // Provides the database migration runner.
using Microsoft.Data.SqlClient; // Provides SqlConnectionStringBuilder.
using Microsoft.Extensions.Configuration; // Provides configuration-loading methods.

namespace AccessRiskDashboard.Migrator; 

internal class Program
{
    static int Main(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory) 
            .AddJsonFile("appsettings.json", optional: false) 
            .AddUserSecrets<Program>() 
            .Build();

        var connectionString = configuration.GetConnectionString("AccessRiskDb"); // Reads ConnectionStrings:AccessRiskDb.

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            Console.Error.WriteLine("Database connection settings are missing.");
            return 1;
        }

        var password = configuration["MSSQL_SA_PASSWORD"];

        if (string.IsNullOrWhiteSpace(password))
        {
            Console.Error.WriteLine("SQL Server password is missing.");
            return 1;
        }

        var connectionStringBuilder = new SqlConnectionStringBuilder(connectionString); // Parses the connection settings.

        connectionStringBuilder.Password = password; // Adds the password to those settings.

        var upgrader = DeployChanges.To // Starts configuring DbUp.
            .SqlDatabase(connectionStringBuilder.ConnectionString) // Selects the SQL Server database.
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly()) // Loads SQL scripts packaged inside this Migrator.
            .JournalToSqlTable("dbo", "SchemaVersions") // Records completed script names in dbo.SchemaVersions.
            .WithTransaction() // Runs the pending migrations within a single transaction.
            .LogToConsole() // Prints migration progress to the console.
            .Build(); // Creates the configured runner; scripts haven't executed yet.

        var result = upgrader.PerformUpgrade(); // Connects, checks migration history, and runs migration scripts.

        if (!result.Successful) // Checks whether migration execution failed.
        {
            Console.Error.WriteLine("Database migration failed.");
            Console.Error.WriteLine(result.Error); // Prints the error details for diagnosis.
            return 1; // Reports failure to the process that launched the Migrator.
        }

        Console.WriteLine("Database migration completed successfully.");
        return 0; // Reports successful completion.
    }
}
