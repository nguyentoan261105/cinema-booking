using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/foodcategories")]
public class FoodCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FoodCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/foodcategories
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.FoodCategories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                FoodCount = x.Foods.Count()
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/foodcategories/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.FoodCategories
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                FoodCount = x.Foods.Count()
            })
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay danh muc."
            });
        }

        return Ok(category);
    }

    // POST: api/foodcategories
    [HttpPost]
    public async Task<IActionResult> CreateCategory(
        [FromBody] FoodCategoryRequest request)
    {
        var name = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Ten danh muc khong duoc de trong."
            });
        }

        var exists = await _context.FoodCategories
            .AnyAsync(x => x.Name.ToLower() == name.ToLower());

        if (exists)
        {
            return Conflict(new
            {
                message = "Danh muc nay da ton tai."
            });
        }

        var category = new FoodCategory
        {
            Name = name
        };

        _context.FoodCategories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.Id },
            new
            {
                category.Id,
                category.Name,
                FoodCount = 0
            });
    }

    // PUT: api/foodcategories/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        [FromBody] FoodCategoryRequest request)
    {
        var category = await _context.FoodCategories.FindAsync(id);

        if (category == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay danh muc."
            });
        }

        var name = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Ten danh muc khong duoc de trong."
            });
        }

        var exists = await _context.FoodCategories
            .AnyAsync(x =>
                x.Id != id &&
                x.Name.ToLower() == name.ToLower());

        if (exists)
        {
            return Conflict(new
            {
                message = "Ten danh muc da duoc su dung."
            });
        }

        category.Name = name;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            category.Id,
            category.Name,
            FoodCount = await _context.Foods
                .CountAsync(x => x.FoodCategoryId == id)
        });
    }

    // DELETE: api/foodcategories/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.FoodCategories.FindAsync(id);

        if (category == null)
        {
            return NotFound(new
            {
                message = "Khong tim thay danh muc."
            });
        }

        var hasFoods = await _context.Foods
            .AnyAsync(x => x.FoodCategoryId == id);

        if (hasFoods)
        {
            return Conflict(new
            {
                message = "Khong the xoa danh muc dang co mon an. Hay chuyen mon an sang danh muc khac truoc."
            });
        }

        _context.FoodCategories.Remove(category);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Da xoa danh muc."
        });
    }
}

public class FoodCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}