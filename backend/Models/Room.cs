namespace backend.Models;

public class Room
{
    public int Id { get; set; }

    public int CinemaId { get; set; }

    public Cinema Cinema { get; set; } = null!;

    public string Name { get; set; } = "";

    public int Rows { get; set; }

    public int Columns { get; set; }

    public ICollection<Seat> Seats { get; set; }
        = new List<Seat>();

    public ICollection<Showtime> Showtimes { get; set; }
        = new List<Showtime>();
}