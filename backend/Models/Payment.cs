namespace backend.Models;

public class Payment
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking Booking { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Method { get; set; } = "";

    public string Status { get; set; } = "Pending";

    public DateTime? PaidAt { get; set; }
}