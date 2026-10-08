namespace backend.Models;

public class BookingFood
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking Booking { get; set; } = null!;

    public int FoodId { get; set; }

    public Food Food { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}