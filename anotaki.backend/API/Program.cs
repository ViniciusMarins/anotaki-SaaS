using anotaki_api.Data;
using anotaki_api.DTOs.Response.Dashboard;
using anotaki_api.Exceptions;
using anotaki_api.Hubs;
using anotaki_api.Queues.Consumers;
using anotaki_api.Queues.Publishers;
using anotaki_api.Queues.Publishers.Interfaces;
using anotaki_api.Services;
using anotaki_api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization.Metadata;

var cultureInfo = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.TypeInfoResolver =
        new DefaultJsonTypeInfoResolver
        {
            Modifiers =
            {
                ti =>
                {
                    if (ti.Type == typeof(CardMetricBase))
                    {
                        ti.PolymorphismOptions = new JsonPolymorphismOptions
                        {
                            TypeDiscriminatorPropertyName = "$type",
                            IgnoreUnrecognizedTypeDiscriminators = true,
                            DerivedTypes =
                            {
                                new JsonDerivedType(typeof(CardMetricItem<int>), "CardMetricItemInt"),
                                new JsonDerivedType(typeof(CardMetricItem<decimal>), "CardMetricItemDecimal"),
                            }
                        };
                    }
                }
            }
        };
});

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.TypeInfoResolver =
            new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                        ti =>
                        {
                            if (ti.Type == typeof(CardMetricBase))
                            {
                                ti.PolymorphismOptions = new JsonPolymorphismOptions
                                {
                                    TypeDiscriminatorPropertyName = "$type",
                                    IgnoreUnrecognizedTypeDiscriminators = true,
                                    DerivedTypes =
                                    {
                                        new JsonDerivedType(typeof(CardMetricItem<int>), "CardMetricItemInt"),
                                        new JsonDerivedType(typeof(CardMetricItem<decimal>), "CardMetricItemDecimal"),
                                    }
                                };
                            }
                        }
                }
            };
    });

// Cache em memória
builder.Services.AddMemoryCache();

// SignalR
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.PayloadSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// GlobalExceptionHandler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configurar o DbContext para usar PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
builder.Services.AddScoped<IExtraService, ExtraService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderPublisher, OrderPublisher>();
builder.Services.AddHostedService<OrderConsumer>();

// Auth
builder.Services.AddAuthorization();
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.RequireHttpsMetadata = false;

        o.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = ClaimTypes.Role, // equivale à URI longa

            NameClaimType = ClaimTypes.NameIdentifier, // corresponde ao "sub"

            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        //habilitar JWT no SignalR
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/orderHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
        };
    });

var app = builder.Build();

app.UseCors(x => x.AllowAnyMethod()
                  .AllowAnyHeader()
                  .SetIsOriginAllowed(origin => true)
                  .AllowCredentials()
                  .WithExposedHeaders("Content-Disposition"));

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();

    context.Database.Migrate();
    await DataSeeder.SeedInitialDataAsync(context);
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OrderHub>("/orderHub");

app.Run();
