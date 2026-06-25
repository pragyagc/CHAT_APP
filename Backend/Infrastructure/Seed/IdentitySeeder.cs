using Domain.Entities;
using Microsoft.AspNetCore.Identity;

public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));

        if (!await roleManager.RoleExistsAsync("User"))
            await roleManager.CreateAsync(new IdentityRole<Guid>("User"));

        var adminEmail = "admin@test.com";

        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            admin = new User
            {
                UserName = "admin",
                Email = adminEmail
            };

            await userManager.CreateAsync(admin, "Admin@123");
            await userManager.AddToRoleAsync(admin, "Admin");
        }






    }


}