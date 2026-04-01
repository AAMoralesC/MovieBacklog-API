using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//Configurar serivicios (SQLite)
builder.Services.AddDbContext<MovieDb>(opt =>opt.UseSqlite("Data Source=movies.db"));
builder.Services.AddOpenApi();

//Definir la política de permisos
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()    // Permite cualquier origen (incluyendo 'null')
                  .AllowAnyMethod()    // Permite GET, POST, PUT, DELETE
                  .AllowAnyHeader();   // Permite cualquier encabezado
        });
});

builder.Services.AddDbContext<MovieDb>(opt => opt.UseSqlite("Data Source=movies.db"));
builder.Services.AddOpenApi();

var app = builder.Build();

//Usar la política de permisos
app.UseCors("AllowAll"); 

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Configuracion del servidor
 if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseHttpsRedirection();

//--Endpoint (CRUD)--

// 1. Obtener todas las películas (READ)
app.MapGet("/movies", async (MovieDb db) => await db.Movies.ToListAsync());

// 2. Obtener peli por ID (Read)
app.MapGet("/movies/{id}", async (int id, MovieDb db) =>await db.Movies.FindAsync(id) is Movie m ? Results.Ok(m) : Results.NotFound());

// 3. Crear una película (Create)   
app.MapPost("/movies", async (Movie movie, MovieDb db) =>{db.Movies.Add(movie);
await db.SaveChangesAsync();
return Results.Created($"/movies/{movie.Id}", movie);
});

// 4. Actualizar una película (Update)
app.MapPut("/movies/{id}", async (int id, Movie inputmovie, MovieDb db) =>
{
    var movie = await db.Movies.FindAsync(id);
    if (movie is null) return Results.NotFound();

    movie.Title = inputmovie.Title;
    movie.Watched = inputmovie.Watched;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// 5. Eliminar (Delete
app.MapDelete("/movies/{id}", async (int id, MovieDb db) =>
{
    if (await db.Movies.FindAsync(id) is Movie movie)
    {
        db.Movies.Remove(movie);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    return Results.NotFound();

});

app.Run();

// Clases
class Movie {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool Watched { get; set; }
}

class MovieDb : DbContext {
    public MovieDb(DbContextOptions<MovieDb> options) : base(options) { }
    public DbSet<Movie> Movies => Set<Movie>();
}