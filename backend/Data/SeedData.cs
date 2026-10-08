using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext db)
    {
        // =========================
        // 1. DATABASE
        // =========================
        await db.Database.MigrateAsync();

        // =========================
        // 2. USERS
        // =========================
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new ApplicationUser
                {
                    FullName = "Administrator",
                    Email = "admin@cinema.com",
                    PasswordHash = "123456",
                    Phone = "0900000001",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new ApplicationUser
                {
                    FullName = "Nguyen Van User",
                    Email = "user@cinema.com",
                    PasswordHash = "123456",
                    Phone = "0900000002",
                    Role = "User",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            );

            await db.SaveChangesAsync();
        }

        // =========================
        // 3. MOVIES
        // =========================
        var movies = await db.Movies.ToListAsync();

        if (!movies.Any())
        {
            movies = new List<Movie>
            {
                new Movie
                {
                    Title = "Avengers: Endgame",
                    Description = "Biet doi Avengers doi mat voi tan cuoc chien lon nhat de bao ve vu tru.",
                    DurationMinutes = 181,
                    ReleaseDate = new DateTime(2019, 4, 26),
                    PosterUrl = "/images/movie-1.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=TcMBFSGVi1c",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Spider-Man: No Way Home",
                    Description = "Spider-Man phai doi mat voi nhung ke thu den tu cac vu tru khac.",
                    DurationMinutes = 148,
                    ReleaseDate = new DateTime(2021, 12, 17),
                    PosterUrl = "/images/movie-2.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=JfVOs4VSpmA",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Avatar: The Way of Water",
                    Description = "Gia dinh Sully tiep tuc hanh trinh bao ve Pandora.",
                    DurationMinutes = 192,
                    ReleaseDate = new DateTime(2022, 12, 16),
                    PosterUrl = "/images/movie-3.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=d9MyW72ELq0",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Doraemon: Nobita va vung dat ly tuong tren bau troi",
                    Description = "Doraemon va Nobita bat dau mot hanh trinh moi tren vung dat tren bau troi.",
                    DurationMinutes = 107,
                    ReleaseDate = new DateTime(2023, 3, 3),
                    PosterUrl = "/images/movie-4.jpg",
                    TrailerUrl = "https://www.youtube.com/",
                    IsActive = true
                }
            };

            db.Movies.AddRange(movies);
            await db.SaveChangesAsync();
        }

        // =========================
        // 4. CINEMAS
        // =========================
        var cinemas = await db.Cinemas.ToListAsync();

        if (!cinemas.Any())
        {
            cinemas = new List<Cinema>
            {
                new Cinema
                {
                    Name = "Cinema Center Quan 1",
                    Address = "123 Nguyen Hue, Quan 1, TP.HCM"
                },

                new Cinema
                {
                    Name = "Cinema Center Thu Duc",
                    Address = "456 Vo Van Ngan, Thu Duc, TP.HCM"
                }
            };

            db.Cinemas.AddRange(cinemas);
            await db.SaveChangesAsync();
        }

        // =========================
        // 5. ROOMS
        // =========================
        var rooms = await db.Rooms.ToListAsync();

        if (!rooms.Any())
        {
            var cinema1 = cinemas.First(x => x.Name == "Cinema Center Quan 1");
            var cinema2 = cinemas.First(x => x.Name == "Cinema Center Thu Duc");

            rooms = new List<Room>
            {
                new Room
                {
                    CinemaId = cinema1.Id,
                    Name = "Phong 1",
                    Rows = 5,
                    Columns = 10
                },

                new Room
                {
                    CinemaId = cinema1.Id,
                    Name = "Phong 2",
                    Rows = 5,
                    Columns = 10
                },

                new Room
                {
                    CinemaId = cinema2.Id,
                    Name = "Phong 1",
                    Rows = 5,
                    Columns = 10
                }
            };

            db.Rooms.AddRange(rooms);
            await db.SaveChangesAsync();
        }

        // =========================
        // 6. SEATS
        // =========================
        foreach (var room in rooms)
        {
            bool hasSeats = await db.Seats.AnyAsync(x => x.RoomId == room.Id);

            if (hasSeats)
                continue;

            var seats = new List<Seat>();

            string[] rowNames =
            {
                "A",
                "B",
                "C",
                "D",
                "E"
            };

            foreach (var row in rowNames)
            {
                for (int number = 1; number <= 10; number++)
                {
                    int type;
                    decimal price;

                    if (row == "A" || row == "B")
                    {
                        // Standard
                        type = 0;
                        price = 75000;
                    }
                    else if (row == "C" || row == "D")
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
                        RowName = row,
                        Number = number,
                        Type = type,
                        Price = price
                    });
                }
            }

            db.Seats.AddRange(seats);
        }

        await db.SaveChangesAsync();

        // =========================
        // 7. SHOWTIMES
        // =========================
        var showtimes = await db.Showtimes.ToListAsync();

        if (!showtimes.Any())
        {
            var movieList = await db.Movies
                .Where(x => x.IsActive)
                .ToListAsync();

            var roomList = await db.Rooms
                .ToListAsync();

            var startTimes = new[]
            {
                new TimeSpan(9, 0, 0),
                new TimeSpan(12, 30, 0),
                new TimeSpan(15, 30, 0),
                new TimeSpan(18, 30, 0),
                new TimeSpan(21, 0, 0)
            };

            var newShowtimes = new List<Showtime>();

            for (int day = 0; day < 7; day++)
            {
                DateTime date = DateTime.Today.AddDays(day);

                for (int movieIndex = 0; movieIndex < movieList.Count; movieIndex++)
                {
                    var movie = movieList[movieIndex];

                    var room = roomList[movieIndex % roomList.Count];

                    var time = startTimes[movieIndex % startTimes.Length];

                    DateTime start = date.Date.Add(time);

                    DateTime end = start.AddMinutes(movie.DurationMinutes);

                    newShowtimes.Add(new Showtime
                    {
                        MovieId = movie.Id,
                        RoomId = room.Id,
                        StartTime = start,
                        EndTime = end,
                        BasePrice = 75000
                    });
                }
            }

            db.Showtimes.AddRange(newShowtimes);

            await db.SaveChangesAsync();

            showtimes = newShowtimes;
        }

        // =========================
        // 8. SHOWTIME SEATS
        // =========================
        foreach (var showtime in showtimes)
        {
            bool hasShowtimeSeats = await db.ShowtimeSeats
                .AnyAsync(x => x.ShowtimeId == showtime.Id);

            if (hasShowtimeSeats)
                continue;

            var seats = await db.Seats
                .Where(x => x.RoomId == showtime.RoomId)
                .ToListAsync();

            foreach (var seat in seats)
            {
                db.ShowtimeSeats.Add(new ShowtimeSeat
                {
                    ShowtimeId = showtime.Id,
                    SeatId = seat.Id,
                    Status = 0,
                    BookingId = null,
                    HeldByUserId = null,
                    HoldUntil = null
                });
            }
        }

        await db.SaveChangesAsync();

        // =========================
        // 9. FOOD CATEGORY
        // =========================
        if (!await db.FoodCategories.AnyAsync())
        {
            db.FoodCategories.AddRange(
                new FoodCategory
                {
                    Name = "Combo"
                },

                new FoodCategory
                {
                    Name = "Bap rang"
                },

                new FoodCategory
                {
                    Name = "Nuoc uong"
                }
            );

            await db.SaveChangesAsync();
        }

        // =========================
        // 10. FOOD
        // =========================
        if (!await db.Foods.AnyAsync())
        {
            var comboCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Combo");

            var popcornCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Bap rang");

            var drinkCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Nuoc uong");

            db.Foods.AddRange(

                new Food
                {
                    Name = "Combo 1 - Bap + Pepsi",
                    Price = 129000,
                    Quantity = 100,
                    ImageUrl = "/images/food-combo1.jpg",
                    FoodCategoryId = comboCategory.Id
                },

                new Food
                {
                    Name = "Combo 2 - Bap + 2 Pepsi",
                    Price = 219000,
                    Quantity = 100,
                    ImageUrl = "/images/food-combo2.jpg",
                    FoodCategoryId = comboCategory.Id
                },

                new Food
                {
                    Name = "Bap rang bo",
                    Price = 69000,
                    Quantity = 100,
                    ImageUrl = "/images/popcorn.jpg",
                    FoodCategoryId = popcornCategory.Id
                },

                new Food
                {
                    Name = "Pepsi",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/pepsi.jpg",
                    FoodCategoryId = drinkCategory.Id
                },

                new Food
                {
                    Name = "Coca Cola",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/coca.jpg",
                    FoodCategoryId = drinkCategory.Id
                },

                new Food
                {
                    Name = "7UP",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/7up.jpg",
                    FoodCategoryId = drinkCategory.Id
                }
            );

            await db.SaveChangesAsync();
        }

        Console.WriteLine("==========================================");
        Console.WriteLine(" SEED DATA COMPLETED");
        Console.WriteLine(" Movies       : " + await db.Movies.CountAsync());
        Console.WriteLine(" Cinemas      : " + await db.Cinemas.CountAsync());
        Console.WriteLine(" Rooms        : " + await db.Rooms.CountAsync());
        Console.WriteLine(" Seats        : " + await db.Seats.CountAsync());
        Console.WriteLine(" Showtimes    : " + await db.Showtimes.CountAsync());
        Console.WriteLine(" ShowtimeSeat : " + await db.ShowtimeSeats.CountAsync());
        Console.WriteLine(" Foods        : " + await db.Foods.CountAsync());
        Console.WriteLine("==========================================");
    }
}