namespace backend.Models;

public class Movie
{
    public int Id { get; set; }

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

    public ICollection<Showtime> Showtimes { get; set; }
        = new List<Showtime>();
}