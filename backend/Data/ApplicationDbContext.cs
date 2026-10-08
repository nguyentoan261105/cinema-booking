using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();

    public DbSet<Movie> Movies => Set<Movie>();

    public DbSet<Cinema> Cinemas => Set<Cinema>();

    public DbSet<Room> Rooms => Set<Room>();

    public DbSet<Seat> Seats => Set<Seat>();

    public DbSet<Showtime> Showtimes => Set<Showtime>();

    public DbSet<ShowtimeSeat> ShowtimeSeats => Set<ShowtimeSeat>();

    public DbSet<Booking> Bookings => Set<Booking>();

    public DbSet<BookingDetail> BookingDetails => Set<BookingDetail>();

    public DbSet<FoodCategory> FoodCategories => Set<FoodCategory>();

    public DbSet<Food> Foods => Set<Food>();

    public DbSet<BookingFood> BookingFoods => Set<BookingFood>();

    public DbSet<Payment> Payments => Set<Payment>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // ==========================================
        // USER
        // ==========================================

        modelBuilder.Entity<ApplicationUser>()
            .HasIndex(x => x.Email)
            .IsUnique();


        // ==========================================
        // CINEMA - ROOM
        // ==========================================

        modelBuilder.Entity<Room>()
            .HasOne(x => x.Cinema)
            .WithMany(x => x.Rooms)
            .HasForeignKey(x => x.CinemaId)
            .OnDelete(DeleteBehavior.Cascade);


        // ==========================================
        // ROOM - SEAT
        // ==========================================

        modelBuilder.Entity<Seat>()
            .HasOne(x => x.Room)
            .WithMany(x => x.Seats)
            .HasForeignKey(x => x.RoomId)
            .OnDelete(DeleteBehavior.Cascade);


        // ==========================================
        // MOVIE - SHOWTIME
        // ==========================================

        modelBuilder.Entity<Showtime>()
            .HasOne(x => x.Movie)
            .WithMany(x => x.Showtimes)
            .HasForeignKey(x => x.MovieId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // ROOM - SHOWTIME
        // ==========================================

        modelBuilder.Entity<Showtime>()
            .HasOne(x => x.Room)
            .WithMany(x => x.Showtimes)
            .HasForeignKey(x => x.RoomId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // SHOWTIME - SEAT
        // ==========================================

        modelBuilder.Entity<ShowtimeSeat>()
            .HasOne(x => x.Showtime)
            .WithMany(x => x.ShowtimeSeats)
            .HasForeignKey(x => x.ShowtimeId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<ShowtimeSeat>()
            .HasOne(x => x.Seat)
            .WithMany(x => x.ShowtimeSeats)
            .HasForeignKey(x => x.SeatId)
            .OnDelete(DeleteBehavior.Restrict);


        // Một ghế chỉ xuất hiện một lần
        // trong một suất chiếu

        modelBuilder.Entity<ShowtimeSeat>()
            .HasIndex(x => new
            {
                x.ShowtimeId,
                x.SeatId
            })
            .IsUnique();


        // ==========================================
        // BOOKING - USER
        // ==========================================

        modelBuilder.Entity<Booking>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // BOOKING - SHOWTIME
        // ==========================================

        modelBuilder.Entity<Booking>()
            .HasOne(x => x.Showtime)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.ShowtimeId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // BOOKING CODE
        // ==========================================

        modelBuilder.Entity<Booking>()
            .HasIndex(x => x.BookingCode)
            .IsUnique();


        // ==========================================
        // BOOKING - BOOKING DETAIL
        // ==========================================

        modelBuilder.Entity<BookingDetail>()
            .HasOne(x => x.Booking)
            .WithMany(x => x.BookingDetails)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<BookingDetail>()
            .HasOne(x => x.Seat)
            .WithMany()
            .HasForeignKey(x => x.SeatId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // FOOD CATEGORY - FOOD
        // ==========================================

        modelBuilder.Entity<Food>()
            .HasOne(x => x.FoodCategory)
            .WithMany(x => x.Foods)
            .HasForeignKey(x => x.FoodCategoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // BOOKING - FOOD
        // ==========================================

        modelBuilder.Entity<BookingFood>()
            .HasOne(x => x.Booking)
            .WithMany(x => x.BookingFoods)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<BookingFood>()
            .HasOne(x => x.Food)
            .WithMany(x => x.BookingFoods)
            .HasForeignKey(x => x.FoodId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // BOOKING - PAYMENT
        // ==========================================

        modelBuilder.Entity<Payment>()
            .HasOne(x => x.Booking)
            .WithOne(x => x.Payment)
            .HasForeignKey<Payment>(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        // ==========================================
        // DECIMAL
        // ==========================================

        modelBuilder.Entity<Seat>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Showtime>()
            .Property(x => x.BasePrice)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Booking>()
            .Property(x => x.TotalAmount)
            .HasPrecision(18, 2);


        modelBuilder.Entity<BookingDetail>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Food>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);


        modelBuilder.Entity<BookingFood>()
            .Property(x => x.UnitPrice)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Payment>()
            .Property(x => x.Amount)
            .HasPrecision(18, 2);
    }
}