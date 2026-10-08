namespace backend.Models;

public class ShowtimeSeat
{
    public int Id { get; set; }

    public int ShowtimeId { get; set; }

    public Showtime Showtime { get; set; } = null!;

    public int SeatId { get; set; }

    public Seat Seat { get; set; } = null!;

    // 0 = Available
    // 1 = Held
    // 2 = Booked
    public int Status { get; set; } = 0;

    public int? BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int? HeldByUserId { get; set; }

    public DateTime? HoldUntil { get; set; }
}