using api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 🔌 Connection string (z user-secrets lub appsettings)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 🔗 DbContext z PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 📦 Dodaj kontrolery i Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🧪 Swagger tylko w dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🌐 Routing kontrolerów
app.MapControllers();

// 🔒 HTTPS opcjonalnie
// app.UseHttpsRedirection();

app.Run();
