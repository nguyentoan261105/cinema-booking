using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CinemasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CinemasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/cinemas
    [HttpGet]
    public async Task<IActionResult> GetCinemas()
    {
        var cinemas = await _context.Cinemas
            .Include(x => x.Rooms)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Address,
                Rooms = x.Rooms.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Rows,
                    r.Columns
                })
            })
            .ToListAsync();

        return Ok(cinemas);
    }

    // GET: api/cinemas/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCinema(int id)
    {
        var cinema = await _context.Cinemas
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Address,
                Rooms = x.Rooms.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Rows,
                    r.Columns
                })
            })
            .FirstOrDefaultAsync();

        if (cinema == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay rap."
            });
        }

        return Ok(cinema);
    }
}