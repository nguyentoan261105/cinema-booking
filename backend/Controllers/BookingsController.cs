using System.Data;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookingsController(ApplicationDbContext context)
    {
        _context = context;
    }


    // ============================================================
    // POST: api/bookings
    // TAO DON DAT VE
    // USER DUOC XAC DINH TU JWT
    // ============================================================
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateBooking(
        [FromBody] CreateBookingRequest request)
    {
        // ========================================================
        // LAY USER ID TU JWT
        // ========================================================
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Phien dang nhap khong hop le."
            });
        }


        // ========================================================
        // TIM USER TRONG DATABASE
        // ========================================================
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId.Value);

        if (user == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Khong tim thay tai khoan dang nhap."
            });
        }


        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Tai khoan cua ban dang bi khoa."
            });
        }


        // ========================================================
        // KIEM TRA SUAT CHIEU
        // ========================================================
        if (request.ShowtimeId <= 0)
        {
            return BadRequest(new
            {
                message = "Khong tim thay suat chieu."
            });
        }


        // ========================================================
        // KIEM TRA GHE
        // ========================================================
        if (request.Seats == null ||
            request.Seats.Count == 0)
        {
            return BadRequest(new
            {
                message = "Vui long chon it nhat 1 ghe."
            });
        }


        // ========================================================
        // KIEM TRA THONG TIN KHACH HANG
        // ========================================================
        if (string.IsNullOrWhiteSpace(request.CustomerName) ||
            string.IsNullOrWhiteSpace(request.CustomerEmail) ||
            string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            return BadRequest(new
            {
                message =
                    "Vui long nhap day du thong tin khach hang."
            });
        }


        // ========================================================
        // PHUONG THUC THANH TOAN
        // ========================================================
        var paymentMethod =
            string.IsNullOrWhiteSpace(request.PaymentMethod)
                ? "qr"
                : request.PaymentMethod
                    .Trim()
                    .ToLower();


        var allowedMethods = new[]
        {
            "qr",
            "momo",
            "vnpay",
            "bank",
            "cash"
        };


        if (!allowedMethods.Contains(paymentMethod))
        {
            return BadRequest(new
            {
                message =
                    "Phuong thuc thanh toan khong hop le."
            });
        }


        // ========================================================
        // TRANSACTION
        // ========================================================
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);


        try
        {
            // ====================================================
            // LAY SUAT CHIEU
            // ====================================================
            var showtime = await _context.Showtimes
                .Include(x => x.Movie)
                .Include(x => x.Room)
                    .ThenInclude(x => x.Cinema)
                .FirstOrDefaultAsync(
                    x => x.Id == request.ShowtimeId);


            if (showtime == null)
            {
                return NotFound(new
                {
                    message =
                        "Khong tim thay suat chieu."
                });
            }


            var now = DateTime.UtcNow;


            // ====================================================
            // LAY TAT CA GHE CUA PHONG
            // ====================================================
            var roomSeats = await _context.Seats
                .Where(x =>
                    x.RoomId == showtime.RoomId)
                .ToListAsync();


            // ====================================================
            // CHUAN HOA TEN GHE
            // ====================================================
            var requestedSeatNames =
                request.Seats
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x))
                    .Select(x =>
                        x.Trim().ToUpper())
                    .Distinct()
                    .ToList();


            if (requestedSeatNames.Count == 0)
            {
                return BadRequest(new
                {
                    message =
                        "Danh sach ghe khong hop le."
                });
            }


            // ====================================================
            // TIM SEAT THEO TEN
            // ====================================================
            var selectedSeats =
                roomSeats
                    .Where(x =>
                        requestedSeatNames.Contains(
                            (x.RowName + x.Number)
                                .ToUpper()))
                    .ToList();


            if (selectedSeats.Count !=
                requestedSeatNames.Count)
            {
                var foundNames =
                    selectedSeats
                        .Select(x =>
                            (x.RowName + x.Number)
                                .ToUpper())
                        .ToHashSet();


                var invalidSeats =
                    requestedSeatNames
                        .Where(x =>
                            !foundNames.Contains(x))
                        .ToList();


                return BadRequest(new
                {
                    message =
                        "Mot so ghe khong ton tai.",

                    seats = invalidSeats
                });
            }


            var seatIds =
                selectedSeats
                    .Select(x => x.Id)
                    .ToList();


            // ====================================================
            // LAY TRANG THAI GHE CUA SUAT CHIEU
            // ====================================================
            var showtimeSeats =
                await _context.ShowtimeSeats
                    .Include(x => x.Seat)
                    .Where(x =>
                        x.ShowtimeId ==
                            request.ShowtimeId &&
                        seatIds.Contains(
                            x.SeatId))
                    .ToListAsync();


            if (showtimeSeats.Count !=
                selectedSeats.Count)
            {
                return BadRequest(new
                {
                    message =
                        "Khong the kiem tra trang thai ghe."
                });
            }


            // ====================================================
            // GIAI PHONG GHE DA HET THOI GIAN GIU
            // ====================================================
            foreach (var showtimeSeat
                     in showtimeSeats)
            {
                if (showtimeSeat.Status == 1 &&
                    showtimeSeat.HoldUntil.HasValue &&
                    showtimeSeat.HoldUntil.Value <= now)
                {
                    showtimeSeat.Status = 0;

                    showtimeSeat.HeldByUserId = null;

                    showtimeSeat.HoldUntil = null;

                    showtimeSeat.BookingId = null;
                }
            }


            // ====================================================
            // KIEM TRA GHE DA DAT / DANG GIU
            // ====================================================
            var unavailableSeats =
                showtimeSeats
                    .Where(x =>
                        x.Status == 2 ||
                        (
                            x.Status == 1 &&
                            (
                                !x.HoldUntil.HasValue ||
                                x.HoldUntil.Value > now
                            )
                        ))
                    .Select(x =>
                        x.Seat.RowName +
                        x.Seat.Number)
                    .ToList();


            if (unavailableSeats.Count > 0)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message =
                        "Mot so ghe da duoc dat hoac dang duoc giu.",

                    seats = unavailableSeats
                });
            }


            // ====================================================
            // TINH TIEN VE
            // ====================================================
            decimal ticketTotal =
                selectedSeats.Sum(x => x.Price);


            // ====================================================
            // TINH TIEN DO AN
            // ====================================================
            var foodItems =
                request.Foods ??
                new List<BookingFoodRequest>();


            var groupedFoods =
                foodItems
                    .Where(x =>
                        x.FoodId > 0 &&
                        x.Quantity > 0)
                    .GroupBy(x =>
                        x.FoodId)
                    .Select(x => new
                    {
                        FoodId = x.Key,

                        Quantity =
                            x.Sum(y =>
                                y.Quantity)
                    })
                    .ToList();


            var foodIds =
                groupedFoods
                    .Select(x =>
                        x.FoodId)
                    .ToList();


            var foods =
                await _context.Foods
                    .Where(x =>
                        foodIds.Contains(x.Id))
                    .ToListAsync();


            if (foods.Count != foodIds.Count)
            {
                var existingIds =
                    foods
                        .Select(x =>
                            x.Id)
                        .ToHashSet();


                var invalidFoodIds =
                    foodIds
                        .Where(x =>
                            !existingIds.Contains(x))
                        .ToList();


                return BadRequest(new
                {
                    message =
                        "Co mon an khong ton tai.",

                    foodIds =
                        invalidFoodIds
                });
            }


            decimal foodTotal = 0;


            foreach (var item in groupedFoods)
            {
                var food =
                    foods.First(x =>
                        x.Id == item.FoodId);


                if (food.Quantity <
                    item.Quantity)
                {
                    return Conflict(new
                    {
                        message =
                            $"Mon {food.Name} khong du so luong.",

                        foodId =
                            food.Id,

                        available =
                            food.Quantity,

                        requested =
                            item.Quantity
                    });
                }


                foodTotal +=
                    food.Price *
                    item.Quantity;
            }


            // ====================================================
            // TONG TIEN
            // ====================================================
            decimal grandTotal =
                ticketTotal +
                foodTotal;


            // ====================================================
            // TAO MA DAT VE
            // ====================================================
            string bookingCode;


            do
            {
                bookingCode =
                    "CB-" +
                    DateTime.Now.ToString(
                        "yyyyMMddHHmmss") +
                    "-" +
                    Random.Shared.Next(
                        100,
                        999);
            }
            while (
                await _context.Bookings
                    .AnyAsync(x =>
                        x.BookingCode ==
                        bookingCode)
            );


            // ====================================================
            // THANH TOAN DEMO
            //
            // QR / MOMO / VNPAY / BANK
            // = DA THANH TOAN
            //
            // CASH
            // = CHO THANH TOAN TAI QUAY
            // ====================================================
            bool isPaid =
                paymentMethod != "cash";


            // ====================================================
            // TAO BOOKING
            // ====================================================
            var booking = new Booking
            {
                BookingCode =
                    bookingCode,

                UserId =
                    user.Id,

                ShowtimeId =
                    showtime.Id,

                TotalAmount =
                    grandTotal,

                Status =
                    isPaid
                        ? 1
                        : 0,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.Bookings.Add(
                booking);


            await _context.SaveChangesAsync();


            // ====================================================
            // LUU CHI TIET GHE
            // ====================================================
            foreach (var seat in selectedSeats)
            {
                var bookingDetail =
                    new BookingDetail
                    {
                        BookingId =
                            booking.Id,

                        SeatId =
                            seat.Id,

                        Price =
                            seat.Price
                    };


                _context.BookingDetails.Add(
                    bookingDetail);
            }


            // ====================================================
            // CAP NHAT GHE
            // ====================================================
            foreach (var showtimeSeat
                     in showtimeSeats)
            {
                showtimeSeat.Status = 2;

                showtimeSeat.BookingId =
                    booking.Id;

                showtimeSeat.HeldByUserId =
                    null;

                showtimeSeat.HoldUntil =
                    null;
            }


            // ====================================================
            // LUU DO AN
            // ====================================================
            foreach (var item
                     in groupedFoods)
            {
                var food =
                    foods.First(x =>
                        x.Id == item.FoodId);


                var bookingFood =
                    new BookingFood
                    {
                        BookingId =
                            booking.Id,

                        FoodId =
                            food.Id,

                        Quantity =
                            item.Quantity,

                        UnitPrice =
                            food.Price
                    };


                _context.BookingFoods.Add(
                    bookingFood);


                // Tru kho
                food.Quantity -=
                    item.Quantity;
            }


            // ====================================================
            // TAO PAYMENT
            // ====================================================
            var payment =
                new Payment
                {
                    BookingId =
                        booking.Id,

                    Amount =
                        grandTotal,

                    Method =
                        paymentMethod,

                    Status =
                        isPaid
                            ? "Paid"
                            : "Pending",

                    PaidAt =
                        isPaid
                            ? DateTime.UtcNow
                            : null
                };


            _context.Payments.Add(
                payment);


            await _context.SaveChangesAsync();


            await transaction.CommitAsync();


            // ====================================================
            // TRA KET QUA
            // ====================================================
            return Ok(new
            {
                success = true,

                message =
                    isPaid
                        ? "Dat ve va thanh toan thanh cong."
                        : "Dat ve thanh cong. Vui long thanh toan tai quay.",

                bookingId =
                    booking.Id,

                bookingCode =
                    booking.BookingCode,

                status =
                    booking.Status,

                paymentStatus =
                    payment.Status,

                paymentMethod =
                    payment.Method,

                totalAmount =
                    booking.TotalAmount,

                showtime = new
                {
                    id =
                        showtime.Id,

                    movie = new
                    {
                        id =
                            showtime.Movie.Id,

                        title =
                            showtime.Movie.Title,

                        posterUrl =
                            showtime.Movie.PosterUrl
                    },

                    cinema = new
                    {
                        id =
                            showtime.Room.Cinema.Id,

                        name =
                            showtime.Room.Cinema.Name,

                        address =
                            showtime.Room.Cinema.Address
                    },

                    room = new
                    {
                        id =
                            showtime.Room.Id,

                        name =
                            showtime.Room.Name
                    },

                    startTime =
                        showtime.StartTime,

                    endTime =
                        showtime.EndTime
                },

                seats =
                    selectedSeats.Select(x => new
                    {
                        id =
                            x.Id,

                        name =
                            x.RowName +
                            x.Number,

                        type =
                            x.Type,

                        price =
                            x.Price
                    }),

                foods =
                    groupedFoods.Select(item =>
                    {
                        var food =
                            foods.First(x =>
                                x.Id ==
                                item.FoodId);

                        return new
                        {
                            id =
                                food.Id,

                            name =
                                food.Name,

                            quantity =
                                item.Quantity,

                            price =
                                food.Price,

                            total =
                                food.Price *
                                item.Quantity
                        };
                    })
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            return StatusCode(
                500,
                new
                {
                    message =
                        "Co loi xay ra khi dat ve.",

                    error =
                        ex.Message
                });
        }
    }


    // ============================================================
    // GET: api/bookings/history
    //
    // LICH SU DAT VE CUA USER DANG DANG NHAP
    // ============================================================
    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetBookingHistory()
    {
        // ========================================================
        // LAY USER ID TU JWT
        // ========================================================
        var userId =
            GetCurrentUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,

                message =
                    "Phien dang nhap khong hop le."
            });
        }


        // ========================================================
        // KIEM TRA USER
        // ========================================================
        var userExists =
            await _context.Users
                .AnyAsync(x =>
                    x.Id ==
                        userId.Value &&
                    x.IsActive);


        if (!userExists)
        {
            return Unauthorized(new
            {
                success = false,

                message =
                    "Tai khoan khong ton tai hoac dang bi khoa."
            });
        }


        // ========================================================
        // LAY BOOKING
        // ========================================================
        var bookings =
            await _context.Bookings
                .AsNoTracking()

                .Where(x =>
                    x.UserId ==
                    userId.Value)

                .Include(x =>
                    x.User)

                .Include(x =>
                    x.Showtime)
                    .ThenInclude(x =>
                        x.Movie)

                .Include(x =>
                    x.Showtime)
                    .ThenInclude(x =>
                        x.Room)
                        .ThenInclude(x =>
                            x.Cinema)

                .Include(x =>
                    x.BookingDetails)
                    .ThenInclude(x =>
                        x.Seat)

                .Include(x =>
                    x.BookingFoods)
                    .ThenInclude(x =>
                        x.Food)

                .Include(x =>
                    x.Payment)

                .OrderByDescending(x =>
                    x.CreatedAt)

                .ToListAsync();


        // ========================================================
        // TAO RESULT
        // ========================================================
        var result =
            bookings.Select(
                booking => new
                {
                    id =
                        booking.Id,

                    bookingCode =
                        booking.BookingCode,


                    // ============================================
                    // KHACH HANG
                    // ============================================
                    customer = new
                    {
                        name =
                            booking.User.FullName,

                        email =
                            booking.User.Email,

                        phone =
                            booking.User.Phone
                    },


                    // ============================================
                    // PHIM
                    //
                    // QUAN TRONG:
                    // posterUrl duoc tra ve tu database
                    // ============================================
                    movie = new
                    {
                        id =
                            booking.Showtime.Movie.Id,

                        title =
                            booking.Showtime.Movie.Title,

                        posterUrl =
                            booking.Showtime.Movie.PosterUrl
                    },


                    // ============================================
                    // RAP
                    // ============================================
                    cinema = new
                    {
                        id =
                            booking.Showtime
                                .Room
                                .Cinema
                                .Id,

                        name =
                            booking.Showtime
                                .Room
                                .Cinema
                                .Name,

                        address =
                            booking.Showtime
                                .Room
                                .Cinema
                                .Address
                    },


                    // ============================================
                    // PHONG
                    // ============================================
                    room = new
                    {
                        id =
                            booking.Showtime
                                .Room
                                .Id,

                        name =
                            booking.Showtime
                                .Room
                                .Name
                    },


                    // ============================================
                    // SUAT CHIEU
                    // ============================================
                    showtime = new
                    {
                        id =
                            booking.Showtime.Id,

                        startTime =
                            booking.Showtime.StartTime,

                        endTime =
                            booking.Showtime.EndTime
                    },


                    // ============================================
                    // GHE
                    // ============================================
                    seats =
                        booking.BookingDetails
                            .Select(x => new
                            {
                                id =
                                    x.Seat.Id,

                                name =
                                    x.Seat.RowName +
                                    x.Seat.Number,

                                type =
                                    x.Seat.Type,

                                price =
                                    x.Price
                            })
                            .ToList(),


                    // ============================================
                    // DO AN
                    // ============================================
                    foods =
                        booking.BookingFoods
                            .Select(x => new
                            {
                                id =
                                    x.Food.Id,

                                name =
                                    x.Food.Name,

                                quantity =
                                    x.Quantity,

                                price =
                                    x.UnitPrice,

                                total =
                                    x.UnitPrice *
                                    x.Quantity
                            })
                            .ToList(),


                    // ============================================
                    // TIEN VE
                    // ============================================
                    ticketTotal =
                        booking.BookingDetails
                            .Sum(x =>
                                x.Price),


                    // ============================================
                    // TIEN DO AN
                    // ============================================
                    foodTotal =
                        booking.BookingFoods
                            .Sum(x =>
                                x.UnitPrice *
                                x.Quantity),


                    // ============================================
                    // TONG TIEN
                    // ============================================
                    totalAmount =
                        booking.TotalAmount,


                    // ============================================
                    // STATUS
                    // ============================================
                    status =
                        booking.Status,


                    statusText =
                        booking.Status == 0
                            ? "Chua thanh toan"
                            : booking.Status == 1
                                ? "Da thanh toan"
                                : booking.Status == 2
                                    ? "Da huy"
                                    : booking.Status == 3
                                        ? "Da su dung"
                                        : "Khong xac dinh",


                    // ============================================
                    // PAYMENT
                    // ============================================
                    payment =
                        booking.Payment == null
                            ? null
                            : new
                            {
                                method =
                                    booking.Payment.Method,

                                methodText =
                                    booking.Payment.Method ==
                                        "qr"
                                            ? "QR Code"
                                            : booking.Payment.Method ==
                                                "momo"
                                                    ? "MoMo"
                                                    : booking.Payment.Method ==
                                                        "vnpay"
                                                            ? "VNPay"
                                                            : booking.Payment.Method ==
                                                                "bank"
                                                                    ? "The ngan hang"
                                                                    : booking.Payment.Method ==
                                                                        "cash"
                                                                            ? "Tien mat"
                                                                            : booking.Payment.Method,

                                status =
                                    booking.Payment.Status,

                                amount =
                                    booking.Payment.Amount,

                                paidAt =
                                    booking.Payment.PaidAt
                            },


                    // ============================================
                    // NGAY TAO BOOKING
                    // ============================================
                    createdAt =
                        booking.CreatedAt
                });


        // ========================================================
        // TRA RESULT
        // ========================================================
        return Ok(new
        {
            success = true,

            count =
                result.Count(),

            bookings =
                result
        });
    }


    // ============================================================
    // GET: api/bookings/{id}
    //
    // XEM CHI TIET 1 VE
    //
    // CHI CHO CHU BOOKING
    // ============================================================
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBooking(int id)
    {
        // ========================================================
        // LAY USER ID TU JWT
        // ========================================================
        var userId =
            GetCurrentUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,

                message =
                    "Phien dang nhap khong hop le."
            });
        }


        // ========================================================
        // TIM BOOKING CUA USER HIEN TAI
        // ========================================================
        var booking =
            await _context.Bookings

                .AsNoTracking()

                .Include(x =>
                    x.User)

                .Include(x =>
                    x.Showtime)
                    .ThenInclude(x =>
                        x.Movie)

                .Include(x =>
                    x.Showtime)
                    .ThenInclude(x =>
                        x.Room)
                        .ThenInclude(x =>
                            x.Cinema)

                .Include(x =>
                    x.BookingDetails)
                    .ThenInclude(x =>
                        x.Seat)

                .Include(x =>
                    x.BookingFoods)
                    .ThenInclude(x =>
                        x.Food)

                .Include(x =>
                    x.Payment)

                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId ==
                        userId.Value);


        // ========================================================
        // KHONG TIM THAY
        // ========================================================
        if (booking == null)
        {
            return NotFound(new
            {
                success = false,

                message =
                    "Khong tim thay don dat ve."
            });
        }


        // ========================================================
        // TRA CHI TIET BOOKING
        //
        // CAU TRUC GIONG HISTORY
        //
        // DE success.js CO THE DOC:
        //
        // bookingData.movie.title
        // bookingData.movie.posterUrl
        //
        // bookingData.cinema.name
        //
        // bookingData.room.name
        //
        // bookingData.showtime.startTime
        //
        // bookingData.seats
        //
        // bookingData.foods
        //
        // bookingData.payment
        // ========================================================
        return Ok(new
        {
            success = true,


            // ====================================================
            // BOOKING
            // ====================================================
            id =
                booking.Id,


            bookingCode =
                booking.BookingCode,


            // ====================================================
            // CUSTOMER
            // ====================================================
            customer = new
            {
                name =
                    booking.User.FullName,

                email =
                    booking.User.Email,

                phone =
                    booking.User.Phone
            },


            // ====================================================
            // MOVIE
            //
            // QUAN TRONG:
            // TRA POSTER TU DATABASE
            // ====================================================
            movie = new
            {
                id =
                    booking.Showtime
                        .Movie
                        .Id,

                title =
                    booking.Showtime
                        .Movie
                        .Title,

                posterUrl =
                    booking.Showtime
                        .Movie
                        .PosterUrl
            },


            // ====================================================
            // CINEMA
            // ====================================================
            cinema = new
            {
                id =
                    booking.Showtime
                        .Room
                        .Cinema
                        .Id,

                name =
                    booking.Showtime
                        .Room
                        .Cinema
                        .Name,

                address =
                    booking.Showtime
                        .Room
                        .Cinema
                        .Address
            },


            // ====================================================
            // ROOM
            // ====================================================
            room = new
            {
                id =
                    booking.Showtime
                        .Room
                        .Id,

                name =
                    booking.Showtime
                        .Room
                        .Name
            },


            // ====================================================
            // SHOWTIME
            // ====================================================
            showtime = new
            {
                id =
                    booking.Showtime.Id,

                movie = new
                {
                    id =
                        booking.Showtime
                            .Movie
                            .Id,

                    title =
                        booking.Showtime
                            .Movie
                            .Title,

                    posterUrl =
                        booking.Showtime
                            .Movie
                            .PosterUrl
                },

                cinema = new
                {
                    id =
                        booking.Showtime
                            .Room
                            .Cinema
                            .Id,

                    name =
                        booking.Showtime
                            .Room
                            .Cinema
                            .Name
                },

                room = new
                {
                    id =
                        booking.Showtime
                            .Room
                            .Id,

                    name =
                        booking.Showtime
                            .Room
                            .Name
                },

                startTime =
                    booking.Showtime
                        .StartTime,

                endTime =
                    booking.Showtime
                        .EndTime
            },


            // ====================================================
            // SEATS
            // ====================================================
            seats =
                booking.BookingDetails
                    .Select(x => new
                    {
                        id =
                            x.Seat.Id,

                        name =
                            x.Seat.RowName +
                            x.Seat.Number,

                        type =
                            x.Seat.Type,

                        price =
                            x.Price
                    })
                    .ToList(),


            // ====================================================
            // FOODS
            // ====================================================
            foods =
                booking.BookingFoods
                    .Select(x => new
                    {
                        id =
                            x.Food.Id,

                        name =
                            x.Food.Name,

                        quantity =
                            x.Quantity,

                        price =
                            x.UnitPrice,

                        unitPrice =
                            x.UnitPrice,

                        total =
                            x.UnitPrice *
                            x.Quantity
                    })
                    .ToList(),


            // ====================================================
            // TIEN VE
            // ====================================================
            ticketTotal =
                booking.BookingDetails
                    .Sum(x =>
                        x.Price),


            // ====================================================
            // TIEN DO AN
            // ====================================================
            foodTotal =
                booking.BookingFoods
                    .Sum(x =>
                        x.UnitPrice *
                        x.Quantity),


            // ====================================================
            // TONG TIEN
            // ====================================================
            totalAmount =
                booking.TotalAmount,


            // ====================================================
            // STATUS
            // ====================================================
            status =
                booking.Status,


            statusText =
                booking.Status == 0
                    ? "Chua thanh toan"
                    : booking.Status == 1
                        ? "Da thanh toan"
                        : booking.Status == 2
                            ? "Da huy"
                            : booking.Status == 3
                                ? "Da su dung"
                                : "Khong xac dinh",


            // ====================================================
            // PAYMENT
            // ====================================================
            payment =
                booking.Payment == null
                    ? null
                    : new
                    {
                        method =
                            booking.Payment.Method,

                        methodText =
                            booking.Payment.Method ==
                                "qr"
                                    ? "QR Code"
                                    : booking.Payment.Method ==
                                        "momo"
                                            ? "MoMo"
                                            : booking.Payment.Method ==
                                                "vnpay"
                                                    ? "VNPay"
                                                    : booking.Payment.Method ==
                                                        "bank"
                                                            ? "The ngan hang"
                                                            : booking.Payment.Method ==
                                                                "cash"
                                                                    ? "Tien mat"
                                                                    : booking.Payment.Method,

                        status =
                            booking.Payment.Status,

                        amount =
                            booking.Payment.Amount,

                        paidAt =
                            booking.Payment.PaidAt
                    },


            // ====================================================
            // CREATED AT
            // ====================================================
            createdAt =
                booking.CreatedAt
        });
    }


    // ============================================================
    // LAY USER ID TU JWT
    // ============================================================
    private int? GetCurrentUserId()
    {
        var claim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);


        if (claim == null)
        {
            return null;
        }


        if (int.TryParse(
            claim.Value,
            out int userId))
        {
            return userId;
        }


        return null;
    }

    // ============================================================
    // HUY VE
    // POST: /api/bookings/{id}/cancel
    // ============================================================
    [Authorize]
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Khong xac dinh duoc nguoi dung."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.Serializable);

        try
        {
            var booking = await _context.Bookings
                .Include(b => b.Showtime)
                .Include(b => b.BookingDetails)
                    .ThenInclude(d => d.Seat)
                .Include(b => b.BookingFoods)
                    .ThenInclude(bf => bf.Food)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(
                    b => b.Id == id &&
                        b.UserId == userId.Value);

            if (booking == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Khong tim thay ve hoac ban khong co quyen huy ve nay."
                });
            }

            // =====================================================
            // KIEM TRA TRANG THAI VE
            // 0 = Pending
            // 1 = Paid
            // 2 = Cancelled
            // 3 = Used
            // =====================================================

            if (booking.Status == 2)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Ve nay da duoc huy truoc do."
                });
            }

            if (booking.Status == 3)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Ve nay da duoc su dung, khong the huy."
                });
            }

            if (booking.Status != 0 && booking.Status != 1)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Trang thai ve khong cho phep huy."
                });
            }

            // =====================================================
            // KHONG CHO HUY NEU SUAT CHIEU DA BAT DAU
            // =====================================================

            if (booking.Showtime == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Khong tim thay thong tin suat chieu."
                });
            }

            if (booking.Showtime.StartTime <= DateTime.Now)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Suat chieu da bat dau, khong the huy ve."
                });
            }

            // =====================================================
            // TRA GHE VE TRANG THAI TRONG
            // =====================================================

            var showtimeSeats = await _context.ShowtimeSeats
                .Where(ss => ss.BookingId == booking.Id)
                .ToListAsync();

            foreach (var showtimeSeat in showtimeSeats)
            {
                showtimeSeat.Status = 0;
                showtimeSeat.BookingId = null;
                showtimeSeat.HeldByUserId = null;
                showtimeSeat.HoldUntil = null;
            }

            // =====================================================
            // TRA LAI SO LUONG DO AN
            // =====================================================

            foreach (var bookingFood in booking.BookingFoods)
            {
                if (bookingFood.Food != null)
                {
                    bookingFood.Food.Quantity += bookingFood.Quantity;
                }
            }

            // =====================================================
            // CAP NHAT TRANG THAI VE
            // =====================================================

            booking.Status = 2;

            // =====================================================
            // CAP NHAT PAYMENT
            // Luu y:
            // Day chi la trang thai huy trong he thong demo.
            // Khong phai xu ly hoan tien that.
            // =====================================================

            if (booking.Payment != null)
            {
                booking.Payment.Status = "Cancelled";
            }

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Huy ve thanh cong.",
                bookingId = booking.Id,
                bookingCode = booking.BookingCode,
                status = booking.Status,
                paymentStatus = booking.Payment?.Status
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            Console.WriteLine("LOI HUY VE: " + ex);

            return StatusCode(500, new
            {
                success = false,
                message = "Khong the huy ve.",
                error = ex.Message
            });
        }
    }
}


// ================================================================
// REQUEST MODEL
// ================================================================

public class CreateBookingRequest
{
    public int ShowtimeId { get; set; }


    public List<string> Seats { get; set; }
        = new();


    public List<BookingFoodRequest> Foods { get; set; }
        = new();


    public string CustomerName { get; set; }
        = "";


    public string CustomerEmail { get; set; }
        = "";


    public string CustomerPhone { get; set; }
        = "";


    public string PaymentMethod { get; set; }
        = "qr";
}


// ================================================================
// BOOKING FOOD REQUEST
// ================================================================

public class BookingFoodRequest
{
    public int FoodId { get; set; }


    public int Quantity { get; set; }
}

