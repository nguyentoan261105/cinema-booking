using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FoodsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/foods
    [HttpGet]
    public async Task<IActionResult> GetFoods()
    {
        var foods = await _context.Foods
            .Include(x => x.FoodCategory)
            .Where(x => x.Quantity > 0)
            .OrderBy(x => x.FoodCategoryId)
            .ThenBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Price,
                x.Quantity,
                x.ImageUrl,

                CategoryId = x.FoodCategoryId,
                CategoryName = x.FoodCategory.Name
            })
            .ToListAsync();

        return Ok(foods);
    }

    // GET: api/foods/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.FoodCategories
            .Select(x => new
            {
                x.Id,
                x.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/foods/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetFood(int id)
    {
        var food = await _context.Foods
            .Include(x => x.FoodCategory)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Price,
                x.Quantity,
                x.ImageUrl,

                CategoryId = x.FoodCategoryId,
                CategoryName = x.FoodCategory.Name
            })
            .FirstOrDefaultAsync();

        if (food == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay san pham."
            });
        }

        return Ok(food);
    }
}