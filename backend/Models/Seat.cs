namespace backend.Models;

public class Seat
{
    public int Id { get; set; }

    public int RoomId { get; set; }

    public Room Room { get; set; } = null!;

    public string RowName { get; set; } = "";

    public int Number { get; set; }

    // Standard = 0
    // VIP = 1
    // Couple = 2
    public int Type { get; set; }

    public decimal Price { get; set; }

    public ICollection<ShowtimeSeat> ShowtimeSeats { get; set; }
        = new List<ShowtimeSeat>();
}