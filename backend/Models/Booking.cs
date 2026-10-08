namespace backend.Models;

public class Booking
{
    public int Id { get; set; }

    public string BookingCode { get; set; } = "";

    public int UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public int ShowtimeId { get; set; }

    public Showtime Showtime { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    // 0 = Pending
    // 1 = Paid
    // 2 = Cancelled
    // 3 = Used
    public int Status { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingDetail> BookingDetails { get; set; }
        = new List<BookingDetail>();

    public ICollection<BookingFood> BookingFoods { get; set; }
        = new List<BookingFood>();

    public Payment? Payment { get; set; }
}