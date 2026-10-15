using Microsoft.Extensions.Configuration; // Provides configuration-loading tools.

namespace AccessRiskDashboard.Migrator;

internal class Program
{
    static int Main(string[] args)
    {
        var configuration = new ConfigurationBuilder() // Starts assembling configuration sources. such as appsettings.json and user secrets.
            .SetBasePath(AppContext.BaseDirectory) // tells the configuration loader which folder to look in for appsettings.json. AppContext.BaseDirectory supplies the application’s base folder
            .AddJsonFile("appsettings.json", optional: false) // Loads the required appsettings.json file.
            .AddUserSecrets<Program>() // Loads secrets associated with this project's UserSecretsId.
            .Build(); // Combines those sources into a configuration object.

        var connectionString = configuration.GetConnectionString("AccessRiskDb"); // Reads ConnectionStrings:AccessRiskDb.

        if (string.IsNullOrWhiteSpace(connectionString)) // Checks for missing, empty, or whitespace-only settings.
        {
            Console.Error.WriteLine("Database connection settings are missing.");
            return 1;
        }

        var password = configuration["MSSQL_SA_PASSWORD"]; // Reads the password from the loaded configuration.

        if (string.IsNullOrWhiteSpace(password)) // Checks whether the password is missing or blank.
        {
            Console.Error.WriteLine("SQL Server password is missing."); // Reports the problem without exposing a password.
            return 1; // Exits with a failure code.
        }

        Console.WriteLine("Database settings and password loaded."); // Confirms both values exist; doesn't test connectivity.
        return 0; // Exits successfully.
    }
}
