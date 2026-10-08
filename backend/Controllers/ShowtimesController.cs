using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ShowtimesController(ApplicationDbContext context)
    {
        _context = context;
    }


    // ============================================
    // LẤY TẤT CẢ SUẤT CHIẾU
    // ============================================

    [HttpGet]
    public async Task<IActionResult> GetShowtimes()
    {
        var showtimes = await _context.Showtimes
            .Include(x => x.Movie)
            .Include(x => x.Room)
                .ThenInclude(x => x.Cinema)
            .OrderBy(x => x.StartTime)
            .Select(x => new
            {
                id = x.Id,

                movieId = x.MovieId,

                movie = new
                {
                    id = x.Movie.Id,
                    title = x.Movie.Title,
                    posterUrl = x.Movie.PosterUrl,
                    durationMinutes = x.Movie.DurationMinutes
                },

                cinema = new
                {
                    id = x.Room.Cinema.Id,
                    name = x.Room.Cinema.Name,
                    address = x.Room.Cinema.Address
                },

                room = new
                {
                    id = x.Room.Id,
                    name = x.Room.Name
                },

                startTime = x.StartTime,
                endTime = x.EndTime,

                basePrice = x.BasePrice
            })
            .ToListAsync();


        return Ok(showtimes);
    }


    // ============================================
    // LẤY SUẤT CHIẾU THEO PHIM
    // ============================================

    [HttpGet("movie/{movieId:int}")]
    public async Task<IActionResult> GetShowtimesByMovie(
        int movieId)
    {
        var movieExists =
            await _context.Movies
                .AnyAsync(x => x.Id == movieId);


        if (!movieExists)
        {
            return NotFound(new
            {
                message = "Khong tim thay phim."
            });
        }


        var showtimes =
            await _context.Showtimes
                .Include(x => x.Movie)
                .Include(x => x.Room)
                    .ThenInclude(x => x.Cinema)
                .Where(x =>
                    x.MovieId == movieId &&
                    x.Movie.IsActive
                )
                .OrderBy(x => x.StartTime)
                .Select(x => new
                {
                    id = x.Id,

                    movieId = x.MovieId,

                    movie = new
                    {
                        id = x.Movie.Id,
                        title = x.Movie.Title,
                        posterUrl = x.Movie.PosterUrl,
                        durationMinutes =
                            x.Movie.DurationMinutes
                    },

                    cinema = new
                    {
                        id = x.Room.Cinema.Id,
                        name = x.Room.Cinema.Name,
                        address = x.Room.Cinema.Address
                    },

                    room = new
                    {
                        id = x.Room.Id,
                        name = x.Room.Name
                    },

                    startTime = x.StartTime,
                    endTime = x.EndTime,

                    basePrice = x.BasePrice
                })
                .ToListAsync();


        return Ok(showtimes);
    }


    // ============================================
    // LẤY 1 SUẤT CHIẾU
    // ============================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetShowtime(int id)
    {
        var showtime =
            await _context.Showtimes
                .Include(x => x.Movie)
                .Include(x => x.Room)
                    .ThenInclude(x => x.Cinema)
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    id = x.Id,

                    movieId = x.MovieId,

                    movie = new
                    {
                        id = x.Movie.Id,
                        title = x.Movie.Title,
                        posterUrl = x.Movie.PosterUrl,
                        durationMinutes =
                            x.Movie.DurationMinutes
                    },

                    cinema = new
                    {
                        id = x.Room.Cinema.Id,
                        name = x.Room.Cinema.Name,
                        address = x.Room.Cinema.Address
                    },

                    room = new
                    {
                        id = x.Room.Id,
                        name = x.Room.Name
                    },

                    startTime = x.StartTime,
                    endTime = x.EndTime,

                    basePrice = x.BasePrice
                })
                .FirstOrDefaultAsync();


        if (showtime == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay suat chieu."
            });
        }


        return Ok(showtime);
    }
}