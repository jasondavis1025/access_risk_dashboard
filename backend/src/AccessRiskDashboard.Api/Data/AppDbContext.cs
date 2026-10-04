using Microsoft.EntityFrameworkCore;

namespace AccessRiskDashboard.Api.Data;

// Entity sets are added as features are built.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options);
