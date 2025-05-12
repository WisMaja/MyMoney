using api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 🔌 Connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 🔗 DbContext z PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 📦 Dodaj kontrolery i Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🌍 Konfiguracja CORS – POZWALAJ NA DOSTĘP Z FRONTU
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000") // lub inny frontend URL
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// 🧪 Swagger tylko w dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🛡️ Włącz CORS przed routingiem
app.UseCors("AllowFrontend");

// 🌐 Routing kontrolerów
app.MapControllers();

// 🔒 HTTPS opcjonalnie
// app.UseHttpsRedirection();

app.Run();

