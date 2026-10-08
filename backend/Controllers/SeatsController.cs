using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SeatsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/seats/showtime/1
    [HttpGet("showtime/{showtimeId:int}")]
    public async Task<IActionResult> GetSeatsByShowtime(int showtimeId)
    {
        var showtime = await _context.Showtimes
            .Include(x => x.Movie)
            .Include(x => x.Room)
                .ThenInclude(x => x.Cinema)
            .FirstOrDefaultAsync(x => x.Id == showtimeId);

        if (showtime == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay suat chieu."
            });
        }

        var seats = await _context.Seats
            .Where(x => x.RoomId == showtime.RoomId)
            .OrderBy(x => x.RowName)
            .ThenBy(x => x.Number)
            .Select(x => new
            {
                id = x.Id,
                rowName = x.RowName,
                number = x.Number,
                type = x.Type,
                price = x.Price,

                status = _context.ShowtimeSeats
                    .Where(ss =>
                        ss.ShowtimeId == showtimeId &&
                        ss.SeatId == x.Id)
                    .Select(ss => ss.Status)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new
        {
            showtime = new
            {
                id = showtime.Id,

                movie = new
                {
                    id = showtime.Movie.Id,
                    title = showtime.Movie.Title,
                    posterUrl = showtime.Movie.PosterUrl,
                    durationMinutes = showtime.Movie.DurationMinutes
                },

                cinema = new
                {
                    id = showtime.Room.Cinema.Id,
                    name = showtime.Room.Cinema.Name,
                    address = showtime.Room.Cinema.Address
                },

                room = new
                {
                    id = showtime.Room.Id,
                    name = showtime.Room.Name,
                    rows = showtime.Room.Rows,
                    columns = showtime.Room.Columns
                },

                startTime = showtime.StartTime,
                endTime = showtime.EndTime,
                basePrice = showtime.BasePrice
            },

            seats
        });
    }
}