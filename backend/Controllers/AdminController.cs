using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db)
    {
        _db = db;
    }

    // =========================================================
    // DASHBOARD
    // GET: /api/admin/dashboard
    // GET: /api/admin/dashboard?year=2026&month=10
    // =========================================================

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(
        [FromQuery] int? year,
        [FromQuery] int? month)
    {
        int selectedYear = year ?? DateTime.Now.Year;
        int selectedMonth = month ?? DateTime.Now.Month;

        if (selectedMonth < 1 || selectedMonth > 12)
        {
            return BadRequest(new
            {
                message = "Thang khong hop le."
            });
        }

        DateTime fromDate = new DateTime(
            selectedYear,
            selectedMonth,
            1
        );

        DateTime toDate = fromDate.AddMonths(1);

        // Booking da thanh toan hoac da su dung
        var soldBookings = _db.Bookings
            .Where(x =>
                (x.Status == 1 || x.Status == 3) &&
                x.CreatedAt >= fromDate &&
                x.CreatedAt < toDate);

        // So ve ban
        int ticketsSold = await soldBookings
            .SelectMany(x => x.BookingDetails)
            .CountAsync();

        // Tong doanh thu
        decimal totalRevenue = await soldBookings
            .Select(x => (decimal?)x.TotalAmount)
            .SumAsync() ?? 0;

        int totalMovies = await _db.Movies.CountAsync();

        int activeMovies = await _db.Movies
            .CountAsync(x => x.IsActive);

        int totalCinemas = await _db.Cinemas.CountAsync();

        int totalRooms = await _db.Rooms.CountAsync();

        int totalShowtimes = await _db.Showtimes
            .CountAsync(x =>
                x.StartTime >= fromDate &&
                x.StartTime < toDate);

        int totalUsers = await _db.Users.CountAsync();

        int totalStaff = await _db.Users
            .CountAsync(x => x.Role == "Staff");

        return Ok(new
        {
            year = selectedYear,
            month = selectedMonth,

            ticketsSold,
            totalRevenue,

            totalMovies,
            activeMovies,

            totalCinemas,
            totalRooms,
            totalShowtimes,

            totalUsers,
            totalStaff
        });
    }

    // =========================================================
    // EMPLOYEE MANAGEMENT
    // =========================================================

    // GET: /api/admin/employees
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        var employees = await _db.Users
            .Where(x => x.Role == "Staff")
            .OrderByDescending(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.FullName,
                x.Email,
                x.Phone,
                x.Role,
                x.IsActive,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(employees);
    }

    // POST: /api/admin/employees
    [HttpPost("employees")]
    public async Task<IActionResult> CreateEmployee(
        [FromBody] EmployeeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new
            {
                message = "Ho ten khong duoc de trong."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email khong duoc de trong."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Mat khau khong duoc de trong."
            });
        }

        bool emailExists = await _db.Users
            .AnyAsync(x => x.Email == request.Email);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "Email da ton tai."
            });
        }

        var employee = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            PasswordHash = request.Password,
            Phone = request.Phone?.Trim() ?? "",
            Role = "Staff",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Users.Add(employee);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Them nhan vien thanh cong.",
            employee = new
            {
                employee.Id,
                employee.FullName,
                employee.Email,
                employee.Phone,
                employee.Role,
                employee.IsActive,
                employee.CreatedAt
            }
        });
    }

    // PUT: /api/admin/employees/{id}
    [HttpPut("employees/{id:int}")]
    public async Task<IActionResult> UpdateEmployee(
        int id,
        [FromBody] EmployeeUpdateRequest request)
    {
        var employee = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.Role == "Staff");

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay nhan vien."
            });
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new
            {
                message = "Ho ten khong duoc de trong."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email khong duoc de trong."
            });
        }

        bool emailExists = await _db.Users
            .AnyAsync(x =>
                x.Email == request.Email &&
                x.Id != id);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "Email da duoc su dung."
            });
        }

        employee.FullName = request.FullName.Trim();
        employee.Email = request.Email.Trim();
        employee.Phone = request.Phone?.Trim() ?? "";

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            employee.PasswordHash = request.Password;
        }

        employee.IsActive = request.IsActive;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cap nhat nhan vien thanh cong."
        });
    }

    // DELETE: /api/admin/employees/{id}
    [HttpDelete("employees/{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.Role == "Staff");

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay nhan vien."
            });
        }

        bool hasBookings = await _db.Bookings
            .AnyAsync(x => x.UserId == id);

        if (hasBookings)
        {
            return BadRequest(new
            {
                message =
                    "Nhan vien da co du lieu dat ve. " +
                    "Khong the xoa. Hay khoa tai khoan thay vi xoa."
            });
        }

        _db.Users.Remove(employee);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Xoa nhan vien thanh cong."
        });
    }

    // =========================================================
    // MOVIE MANAGEMENT
    // =========================================================

    // GET: /api/admin/movies
    [HttpGet("movies")]
    public async Task<IActionResult> GetMovies()
    {
        var movies = await _db.Movies
            .OrderByDescending(x => x.Id)
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
                x.IsActive,
                showtimeCount = x.Showtimes.Count()
            })
            .ToListAsync();

        return Ok(movies);
    }

    // GET: /api/admin/movies/{id}
    [HttpGet("movies/{id:int}")]
    public async Task<IActionResult> GetMovie(int id)
    {
        var movie = await _db.Movies
            .Where(x => x.Id == id)
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

    // POST: /api/admin/movies
    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovie(
        [FromBody] MovieRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Ten phim khong duoc de trong."
            });
        }

        if (request.DurationMinutes <= 0)
        {
            return BadRequest(new
            {
                message = "Thoi luong phim phai lon hon 0."
            });
        }

        var movie = new Movie
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim() ?? "",
            DurationMinutes = request.DurationMinutes,
            ReleaseDate = request.ReleaseDate,
            PosterUrl = request.PosterUrl?.Trim() ?? "",
            TrailerUrl = request.TrailerUrl?.Trim() ?? "",
            Rating = request.Rating,
            Genre = request.Genre?.Trim() ?? "",
            Director = request.Director?.Trim() ?? "",
            Actors = request.Actors?.Trim() ?? "",
            IsActive = request.IsActive
        };

        _db.Movies.Add(movie);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Them phim thanh cong.",
            movie
        });
    }

    // PUT: /api/admin/movies/{id}
    [HttpPut("movies/{id:int}")]
    public async Task<IActionResult> UpdateMovie(
        int id,
        [FromBody] MovieRequest request)
    {
        var movie = await _db.Movies
            .FirstOrDefaultAsync(x => x.Id == id);

        if (movie == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phim."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Ten phim khong duoc de trong."
            });
        }

        if (request.DurationMinutes <= 0)
        {
            return BadRequest(new
            {
                message = "Thoi luong phim phai lon hon 0."
            });
        }

        movie.Title = request.Title.Trim();
        movie.Description = request.Description?.Trim() ?? "";
        movie.DurationMinutes = request.DurationMinutes;
        movie.ReleaseDate = request.ReleaseDate;
        movie.PosterUrl = request.PosterUrl?.Trim() ?? "";
        movie.TrailerUrl = request.TrailerUrl?.Trim() ?? "";
        movie.Rating = request.Rating;
        movie.Genre = request.Genre?.Trim() ?? "";
        movie.Director = request.Director?.Trim() ?? "";
        movie.Actors = request.Actors?.Trim() ?? "";
        movie.IsActive = request.IsActive;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cap nhat phim thanh cong."
        });
    }

    // DELETE: /api/admin/movies/{id}
    [HttpDelete("movies/{id:int}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var movie = await _db.Movies
            .FirstOrDefaultAsync(x => x.Id == id);

        if (movie == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phim."
            });
        }

        bool hasShowtimes = await _db.Showtimes
            .AnyAsync(x => x.MovieId == id);

        if (hasShowtimes)
        {
            return BadRequest(new
            {
                message =
                    "Phim da co suat chieu. " +
                    "Khong the xoa. Hay chuyen phim sang trang thai khong hoat dong."
            });
        }

        _db.Movies.Remove(movie);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Xoa phim thanh cong."
        });
    }

    // =========================================================
    // CINEMA MANAGEMENT
    // =========================================================

    // GET: /api/admin/cinemas
    [HttpGet("cinemas")]
    public async Task<IActionResult> GetCinemas()
    {
        var cinemas = await _db.Cinemas
            .OrderByDescending(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Address,
                roomCount = x.Rooms.Count()
            })
            .ToListAsync();

        return Ok(cinemas);
    }

    // GET: /api/admin/cinemas/{id}
    [HttpGet("cinemas/{id:int}")]
    public async Task<IActionResult> GetCinema(int id)
    {
        var cinema = await _db.Cinemas
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Address,

                rooms = x.Rooms
                    .OrderBy(r => r.Id)
                    .Select(r => new
                    {
                        r.Id,
                        r.Name,
                        r.Rows,
                        r.Columns,
                        seatCount = r.Seats.Count()
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

    // POST: /api/admin/cinemas
    [HttpPost("cinemas")]
    public async Task<IActionResult> CreateCinema(
        [FromBody] CinemaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Ten rap khong duoc de trong."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Address))
        {
            return BadRequest(new
            {
                message = "Dia chi rap khong duoc de trong."
            });
        }

        var cinema = new Cinema
        {
            Name = request.Name.Trim(),
            Address = request.Address.Trim()
        };

        _db.Cinemas.Add(cinema);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Them rap thanh cong.",
            cinema
        });
    }

    // PUT: /api/admin/cinemas/{id}
    [HttpPut("cinemas/{id:int}")]
    public async Task<IActionResult> UpdateCinema(
        int id,
        [FromBody] CinemaRequest request)
    {
        var cinema = await _db.Cinemas
            .FirstOrDefaultAsync(x => x.Id == id);

        if (cinema == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay rap."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Ten rap khong duoc de trong."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Address))
        {
            return BadRequest(new
            {
                message = "Dia chi rap khong duoc de trong."
            });
        }

        cinema.Name = request.Name.Trim();
        cinema.Address = request.Address.Trim();

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cap nhat rap thanh cong."
        });
    }

    // DELETE: /api/admin/cinemas/{id}
    [HttpDelete("cinemas/{id:int}")]
    public async Task<IActionResult> DeleteCinema(int id)
    {
        var cinema = await _db.Cinemas
            .FirstOrDefaultAsync(x => x.Id == id);

        if (cinema == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay rap."
            });
        }

        bool hasRooms = await _db.Rooms
            .AnyAsync(x => x.CinemaId == id);

        if (hasRooms)
        {
            return BadRequest(new
            {
                message =
                    "Rap van con phong. " +
                    "Hay xoa cac phong truoc khi xoa rap."
            });
        }

        _db.Cinemas.Remove(cinema);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Xoa rap thanh cong."
        });
    }

    // =========================================================
    // ROOM MANAGEMENT
    // =========================================================

    // GET: /api/admin/rooms
    [HttpGet("rooms")]
    public async Task<IActionResult> GetRooms()
    {
        var rooms = await _db.Rooms
            .Include(x => x.Cinema)
            .OrderByDescending(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.CinemaId,
                cinemaName = x.Cinema.Name,
                x.Name,
                x.Rows,
                x.Columns,
                seatCount = x.Seats.Count(),
                showtimeCount = x.Showtimes.Count()
            })
            .ToListAsync();

        return Ok(rooms);
    }

    // GET: /api/admin/rooms/{id}
    [HttpGet("rooms/{id:int}")]
    public async Task<IActionResult> GetRoom(int id)
    {
        var room = await _db.Rooms
            .Include(x => x.Cinema)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.CinemaId,
                cinemaName = x.Cinema.Name,
                x.Name,
                x.Rows,
                x.Columns,
                seatCount = x.Seats.Count(),
                showtimeCount = x.Showtimes.Count()
            })
            .FirstOrDefaultAsync();

        if (room == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phong."
            });
        }

        return Ok(room);
    }

    // POST: /api/admin/rooms
    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom(
        [FromBody] RoomRequest request)
    {
        if (request.CinemaId <= 0)
        {
            return BadRequest(new
            {
                message = "Vui long chon rap."
            });
        }

        var cinema = await _db.Cinemas
            .FirstOrDefaultAsync(x => x.Id == request.CinemaId);

        if (cinema == null)
        {
            return NotFound(new
            {
                message = "Rap khong ton tai."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Ten phong khong duoc de trong."
            });
        }

        if (request.Rows <= 0 || request.Columns <= 0)
        {
            return BadRequest(new
            {
                message = "So hang va so cot phai lon hon 0."
            });
        }

        var room = new Room
        {
            CinemaId = request.CinemaId,
            Name = request.Name.Trim(),
            Rows = request.Rows,
            Columns = request.Columns
        };

        _db.Rooms.Add(room);

        await _db.SaveChangesAsync();

        // Tao ghe tu dong
        var seats = new List<Seat>();

        for (int rowIndex = 0; rowIndex < request.Rows; rowIndex++)
        {
            string rowName = GetRowName(rowIndex);

            for (int number = 1;
                 number <= request.Columns;
                 number++)
            {
                int type;
                decimal price;

                if (rowIndex < 2)
                {
                    // Standard
                    type = 0;
                    price = 75000;
                }
                else if (rowIndex < 4)
                {
                    // VIP
                    type = 1;
                    price = 95000;
                }
                else
                {
                    // Couple
                    type = 2;
                    price = 150000;
                }

                seats.Add(new Seat
                {
                    RoomId = room.Id,
                    RowName = rowName,
                    Number = number,
                    Type = type,
                    Price = price
                });
            }
        }

        _db.Seats.AddRange(seats);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Them phong thanh cong.",
            roomId = room.Id,
            seatCount = seats.Count
        });
    }

    // PUT: /api/admin/rooms/{id}
    [HttpPut("rooms/{id:int}")]
    public async Task<IActionResult> UpdateRoom(
        int id,
        [FromBody] RoomRequest request)
    {
        var room = await _db.Rooms
            .FirstOrDefaultAsync(x => x.Id == id);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phong."
            });
        }

        var cinema = await _db.Cinemas
            .FirstOrDefaultAsync(x => x.Id == request.CinemaId);

        if (cinema == null)
        {
            return NotFound(new
            {
                message = "Rap khong ton tai."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Ten phong khong duoc de trong."
            });
        }

        if (request.Rows <= 0 || request.Columns <= 0)
        {
            return BadRequest(new
            {
                message = "So hang va so cot phai lon hon 0."
            });
        }

        bool hasShowtimes = await _db.Showtimes
            .AnyAsync(x => x.RoomId == id);

        bool dimensionsChanged =
            room.Rows != request.Rows ||
            room.Columns != request.Columns;

        if (dimensionsChanged && hasShowtimes)
        {
            return BadRequest(new
            {
                message =
                    "Phong da co suat chieu nen khong the thay doi so hang va so cot."
            });
        }

        room.CinemaId = request.CinemaId;
        room.Name = request.Name.Trim();

        if (!dimensionsChanged)
        {
            room.Rows = request.Rows;
            room.Columns = request.Columns;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat phong thanh cong."
            });
        }

        // Neu thay doi kich thuoc va chua co suat chieu
        var oldSeats = await _db.Seats
            .Where(x => x.RoomId == id)
            .ToListAsync();

        _db.Seats.RemoveRange(oldSeats);

        room.Rows = request.Rows;
        room.Columns = request.Columns;

        await _db.SaveChangesAsync();

        var newSeats = new List<Seat>();

        for (int rowIndex = 0;
             rowIndex < request.Rows;
             rowIndex++)
        {
            string rowName = GetRowName(rowIndex);

            for (int number = 1;
                 number <= request.Columns;
                 number++)
            {
                int type;
                decimal price;

                if (rowIndex < 2)
                {
                    type = 0;
                    price = 75000;
                }
                else if (rowIndex < 4)
                {
                    type = 1;
                    price = 95000;
                }
                else
                {
                    type = 2;
                    price = 150000;
                }

                newSeats.Add(new Seat
                {
                    RoomId = room.Id,
                    RowName = rowName,
                    Number = number,
                    Type = type,
                    Price = price
                });
            }
        }

        _db.Seats.AddRange(newSeats);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cap nhat phong thanh cong.",
            seatCount = newSeats.Count
        });
    }

    // DELETE: /api/admin/rooms/{id}
    [HttpDelete("rooms/{id:int}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var room = await _db.Rooms
            .FirstOrDefaultAsync(x => x.Id == id);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phong."
            });
        }

        bool hasShowtimes = await _db.Showtimes
            .AnyAsync(x => x.RoomId == id);

        if (hasShowtimes)
        {
            return BadRequest(new
            {
                message =
                    "Phong da co suat chieu. Khong the xoa."
            });
        }

        _db.Rooms.Remove(room);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Xoa phong thanh cong."
        });
    }

    // =========================================================
    // SEAT MANAGEMENT
    // =========================================================

    // GET: /api/admin/seats?roomId=1
    [HttpGet("seats")]
    public async Task<IActionResult> GetSeats(
        [FromQuery] int roomId)
    {
        if (roomId <= 0)
        {
            return BadRequest(new
            {
                message = "Vui long chon phong."
            });
        }

        var room = await _db.Rooms
            .Include(x => x.Cinema)
            .FirstOrDefaultAsync(x => x.Id == roomId);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay phong."
            });
        }

        var seats = await _db.Seats
            .Where(x => x.RoomId == roomId)
            .OrderBy(x => x.RowName)
            .ThenBy(x => x.Number)
            .Select(x => new
            {
                x.Id,
                x.RoomId,
                roomName = room.Name,
                cinemaId = room.CinemaId,
                cinemaName = room.Cinema.Name,

                x.RowName,
                x.Number,
                x.Type,
                x.Price,

                seatName = x.RowName + x.Number
            })
            .ToListAsync();

        return Ok(new
        {
            room = new
            {
                room.Id,
                room.Name,
                room.Rows,
                room.Columns,
                cinemaId = room.CinemaId,
                cinemaName = room.Cinema.Name
            },

            seats
        });
    }


    // GET: /api/admin/seats/{id}
    [HttpGet("seats/{id:int}")]
    public async Task<IActionResult> GetSeat(int id)
    {
        var seat = await _db.Seats
            .Include(x => x.Room)
                .ThenInclude(x => x.Cinema)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.RoomId,

                roomName = x.Room.Name,

                cinemaId = x.Room.CinemaId,
                cinemaName = x.Room.Cinema.Name,

                x.RowName,
                x.Number,
                x.Type,
                x.Price,

                seatName = x.RowName + x.Number
            })
            .FirstOrDefaultAsync();

        if (seat == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay ghe."
            });
        }

        return Ok(seat);
    }


    // PUT: /api/admin/seats/{id}
    [HttpPut("seats/{id:int}")]
    public async Task<IActionResult> UpdateSeat(
        int id,
        [FromBody] SeatRequest request)
    {
        var seat = await _db.Seats
            .FirstOrDefaultAsync(x => x.Id == id);

        if (seat == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay ghe."
            });
        }

        // Kiem tra loai ghe
        if (request.Type < 0 || request.Type > 2)
        {
            return BadRequest(new
            {
                message = "Loai ghe khong hop le."
            });
        }

        // Kiem tra gia
        if (request.Price < 0)
        {
            return BadRequest(new
            {
                message = "Gia ghe khong duoc nho hon 0."
            });
        }

        // Kiem tra ghe nay da tung duoc dat ve chua
        bool hasBooking = await _db.BookingDetails
            .AnyAsync(x => x.SeatId == id);

        if (hasBooking)
        {
            return BadRequest(new
            {
                message =
                    "Ghe da tung duoc dat ve nen khong the thay doi loai ghe. " +
                    "Ban van co the thay doi gia ghe."
            });
        }

        seat.Type = request.Type;
        seat.Price = request.Price;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cap nhat ghe thanh cong.",

            seat = new
            {
                seat.Id,
                seat.RoomId,
                seat.RowName,
                seat.Number,
                seat.Type,
                seat.Price,
                seatName = seat.RowName + seat.Number
            }
        });
    }


    // =========================================================
    // DTO - SEAT
    // =========================================================

    public class SeatRequest
    {
        public int Type { get; set; }

        public decimal Price { get; set; }
    }

    // =========================================================
    // SHOWTIME MANAGEMENT
    // =========================================================

    // GET: /api/admin/showtimes
    [HttpGet("showtimes")]
    public async Task<IActionResult> GetShowtimes()
    {
        var showtimes = await _db.Showtimes
            .Include(x => x.Movie)
            .Include(x => x.Room)
                .ThenInclude(x => x.Cinema)
            .OrderBy(x => x.StartTime)
            .Select(x => new
            {
                x.Id,

                movieId = x.MovieId,
                movieName = x.Movie.Title,

                roomId = x.RoomId,
                roomName = x.Room.Name,

                cinemaId = x.Room.CinemaId,
                cinemaName = x.Room.Cinema.Name,

                x.StartTime,
                x.EndTime,
                x.BasePrice,

                totalSeats = x.ShowtimeSeats.Count(),
                soldSeats = x.ShowtimeSeats
                    .Count(s => s.Status == 2)
            })
            .ToListAsync();

        return Ok(showtimes);
    }

    // GET: /api/admin/showtimes/{id}
    [HttpGet("showtimes/{id:int}")]
    public async Task<IActionResult> GetShowtime(int id)
    {
        var showtime = await _db.Showtimes
            .Include(x => x.Movie)
            .Include(x => x.Room)
                .ThenInclude(x => x.Cinema)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,

                movieId = x.MovieId,
                movieName = x.Movie.Title,

                roomId = x.RoomId,
                roomName = x.Room.Name,

                cinemaId = x.Room.CinemaId,
                cinemaName = x.Room.Cinema.Name,

                x.StartTime,
                x.EndTime,
                x.BasePrice,

                totalSeats = x.ShowtimeSeats.Count(),
                soldSeats = x.ShowtimeSeats
                    .Count(s => s.Status == 2)
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

    // POST: /api/admin/showtimes
    [HttpPost("showtimes")]
    public async Task<IActionResult> CreateShowtime(
        [FromBody] ShowtimeRequest request)
    {
        var movie = await _db.Movies
            .FirstOrDefaultAsync(x =>
                x.Id == request.MovieId &&
                x.IsActive);

        if (movie == null)
        {
            return NotFound(new
            {
                message = "Phim khong ton tai hoac da bi tat."
            });
        }

        var room = await _db.Rooms
            .FirstOrDefaultAsync(x => x.Id == request.RoomId);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Phong khong ton tai."
            });
        }

        if (request.StartTime >= request.EndTime)
        {
            return BadRequest(new
            {
                message =
                    "Thoi gian bat dau phai nho hon thoi gian ket thuc."
            });
        }

        if (request.BasePrice <= 0)
        {
            return BadRequest(new
            {
                message = "Gia ve phai lon hon 0."
            });
        }

        bool overlapping = await _db.Showtimes
            .AnyAsync(x =>
                x.RoomId == request.RoomId &&
                request.StartTime < x.EndTime &&
                request.EndTime > x.StartTime);

        if (overlapping)
        {
            return Conflict(new
            {
                message =
                    "Phong da co suat chieu trung thoi gian."
            });
        }

        var showtime = new Showtime
        {
            MovieId = request.MovieId,
            RoomId = request.RoomId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            BasePrice = request.BasePrice
        };

        _db.Showtimes.Add(showtime);

        await _db.SaveChangesAsync();

        // Tao ShowtimeSeat cho tat ca ghe cua phong
        var seats = await _db.Seats
            .Where(x => x.RoomId == room.Id)
            .ToListAsync();

        foreach (var seat in seats)
        {
            _db.ShowtimeSeats.Add(new ShowtimeSeat
            {
                ShowtimeId = showtime.Id,
                SeatId = seat.Id,
                Status = 0,
                BookingId = null,
                HeldByUserId = null,
                HoldUntil = null
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Them suat chieu thanh cong.",
            showtimeId = showtime.Id,
            seatCount = seats.Count
        });
    }

    // PUT: /api/admin/showtimes/{id}
    [HttpPut("showtimes/{id:int}")]
    public async Task<IActionResult> UpdateShowtime(
        int id,
        [FromBody] ShowtimeRequest request)
    {
        var showtime = await _db.Showtimes
            .FirstOrDefaultAsync(x => x.Id == id);

        if (showtime == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay suat chieu."
            });
        }

        var movie = await _db.Movies
            .FirstOrDefaultAsync(x =>
                x.Id == request.MovieId &&
                x.IsActive);

        if (movie == null)
        {
            return NotFound(new
            {
                message = "Phim khong ton tai hoac da bi tat."
            });
        }

        var room = await _db.Rooms
            .FirstOrDefaultAsync(x => x.Id == request.RoomId);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Phong khong ton tai."
            });
        }

        if (request.StartTime >= request.EndTime)
        {
            return BadRequest(new
            {
                message =
                    "Thoi gian bat dau phai nho hon thoi gian ket thuc."
            });
        }

        if (request.BasePrice <= 0)
        {
            return BadRequest(new
            {
                message = "Gia ve phai lon hon 0."
            });
        }

        bool hasBookings = await _db.Bookings
            .AnyAsync(x => x.ShowtimeId == id);

        bool roomChanged = showtime.RoomId != request.RoomId;

        if (roomChanged && hasBookings)
        {
            return BadRequest(new
            {
                message =
                    "Suat chieu da co nguoi dat ve nen khong the doi phong."
            });
        }

        bool overlapping = await _db.Showtimes
            .AnyAsync(x =>
                x.Id != id &&
                x.RoomId == request.RoomId &&
                request.StartTime < x.EndTime &&
                request.EndTime > x.StartTime);

        if (overlapping)
        {
            return Conflict(new
            {
                message =
                    "Phong da co suat chieu trung thoi gian."
            });
        }

        showtime.MovieId = request.MovieId;
        showtime.RoomId = request.RoomId;
        showtime.StartTime = request.StartTime;
        showtime.EndTime = request.EndTime;
        showtime.BasePrice = request.BasePrice;

        await _db.SaveChangesAsync();

        // Neu doi phong va chua co booking
        if (roomChanged)
        {
            var oldSeats = await _db.ShowtimeSeats
                .Where(x => x.ShowtimeId == id)
                .ToListAsync();

            _db.ShowtimeSeats.RemoveRange(oldSeats);

            await _db.SaveChangesAsync();

            var newSeats = await _db.Seats
                .Where(x => x.RoomId == request.RoomId)
                .ToListAsync();

            foreach (var seat in newSeats)
            {
                _db.ShowtimeSeats.Add(new ShowtimeSeat
                {
                    ShowtimeId = id,
                    SeatId = seat.Id,
                    Status = 0,
                    BookingId = null,
                    HeldByUserId = null,
                    HoldUntil = null
                });
            }

            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Cap nhat suat chieu thanh cong."
        });
    }

    // DELETE: /api/admin/showtimes/{id}
    [HttpDelete("showtimes/{id:int}")]
    public async Task<IActionResult> DeleteShowtime(int id)
    {
        var showtime = await _db.Showtimes
            .FirstOrDefaultAsync(x => x.Id == id);

        if (showtime == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay suat chieu."
            });
        }

        bool hasBookings = await _db.Bookings
            .AnyAsync(x => x.ShowtimeId == id);

        if (hasBookings)
        {
            return BadRequest(new
            {
                message =
                    "Suat chieu da co ve dat. Khong the xoa."
            });
        }

        _db.Showtimes.Remove(showtime);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Xoa suat chieu thanh cong."
        });
    }

    // =========================================================
    // HELPER
    // =========================================================

    private static string GetRowName(int index)
    {
        string result = "";

        index++;

        while (index > 0)
        {
            index--;

            result =
                (char)('A' + (index % 26))
                + result;

            index /= 26;
        }

        return result;
    }

    // =========================================================
    // DTO - EMPLOYEE
    // =========================================================

    public class EmployeeRequest
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Phone { get; set; } = "";
    }

    public class EmployeeUpdateRequest
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Phone { get; set; } = "";
        public bool IsActive { get; set; } = true;
    }

    // =========================================================
    // DTO - MOVIE
    // =========================================================

    public class MovieRequest
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public int DurationMinutes { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string PosterUrl { get; set; } = "";
        public string TrailerUrl { get; set; } = "";
        public decimal Rating { get; set; }
        public string Genre { get; set; } = "";
        public string Director { get; set; } = "";
        public string Actors { get; set; } = "";
        public bool IsActive { get; set; } = true;
    }

    // =========================================================
    // DTO - CINEMA
    // =========================================================

    public class CinemaRequest
    {
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
    }

    // =========================================================
    // DTO - ROOM
    // =========================================================

    public class RoomRequest
    {
        public int CinemaId { get; set; }
        public string Name { get; set; } = "";
        public int Rows { get; set; }
        public int Columns { get; set; }
    }

    // =========================================================
    // DTO - SHOWTIME
    // =========================================================

    public class ShowtimeRequest
    {
        public int MovieId { get; set; }
        public int RoomId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal BasePrice { get; set; }
    }
}