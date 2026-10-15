using System.Reflection;

namespace AccessRiskDashboard.Migrator;

internal class Program
{
    static int Main(string[] args)
    {
        var assembly = Assembly.GetExecutingAssembly(); // Gets an object representing the compiled code currently executing — our Migrator — and stores it in assembly.

        var scriptNames = assembly.GetManifestResourceNames() //Gets the names of all embedded resources. currently theres only the one in .csproj file, but we can add more in the future.
            .Where(name => name.EndsWith(".sql",
                StringComparison.OrdinalIgnoreCase))
            .OrderBy(name => name)
            .ToArray();

        if (scriptNames.Length == 0) 
        {
            Console.Error.WriteLine("No embedded SQL scripts found.");
            return 1; // Return a non-zero exit code to indicate an error.
        }

        foreach (var scriptName in scriptNames)
        {
            Console.WriteLine(scriptName);
        }

        return 0; // Return 0 to indicate success.
    }
}
