using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MoviesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/movies
    [HttpGet]
    public async Task<IActionResult> GetMovies()
    {
        var movies = await _context.Movies
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.ReleaseDate)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Description,
                x.DurationMinutes,
                x.ReleaseDate,
                x.PosterUrl,
                x.TrailerUrl,
                x.Rating,
                x.Genre,
                x.Director,
                x.Actors,
                x.IsActive
            })
            .ToListAsync();

        return Ok(movies);
    }

    // GET: api/movies/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMovie(int id)
    {
        var movie = await _context.Movies
            .Where(x => x.Id == id && x.IsActive)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Description,
                x.DurationMinutes,
                x.ReleaseDate,
                x.PosterUrl,
                x.TrailerUrl,
                x.Rating,
                x.Genre,
                x.Director,
                x.Actors,
                x.IsActive
            })
            .FirstOrDefaultAsync();

        if (movie == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phim."
            });
        }

        return Ok(movie);
    }
}