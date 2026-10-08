namespace backend.Models;

public class Food
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public decimal Price { get; set; }

    public int Quantity { get; set; }

    public string ImageUrl { get; set; } = "";

    public int FoodCategoryId { get; set; }

    public FoodCategory FoodCategory { get; set; } = null!;

    public ICollection<BookingFood> BookingFoods { get; set; }
        = new List<BookingFood>();
}