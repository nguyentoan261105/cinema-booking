namespace backend.Models;

public class Showtime
{
    public int Id { get; set; }

    public int MovieId { get; set; }

    public Movie Movie { get; set; } = null!;

    public int RoomId { get; set; }

    public Room Room { get; set; } = null!;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public decimal BasePrice { get; set; }

    public ICollection<ShowtimeSeat> ShowtimeSeats { get; set; }
        = new List<ShowtimeSeat>();

    public ICollection<Booking> Bookings { get; set; }
        = new List<Booking>();
}