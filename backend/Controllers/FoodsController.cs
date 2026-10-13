using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
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
        // Mac dinh: chi lay mon dang kinh doanh va con hang.
        // GET: api/foods?includeInactive=true
        // Danh cho quan tri: lay tat ca mon an.
        [HttpGet]
        public async Task<IActionResult> GetFoods(
            [FromQuery] bool includeInactive = false)
        {
            var query = _context.Foods
                .AsNoTracking()
                .Include(x => x.FoodCategory)
                .AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(x =>
                    x.IsActive && x.Quantity > 0);
            }

            var foods = await query
                .OrderBy(x => x.FoodCategoryId)
                .ThenBy(x => x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Price,
                    x.Quantity,
                    x.ImageUrl,
                    x.IsActive,
                    CategoryId = x.FoodCategoryId,
                    CategoryName = x.FoodCategory.Name
                })
                .ToListAsync();

            return Ok(foods);
        }

        // GET: api/foods/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetFood(int id)
        {
            var food = await _context.Foods
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Price,
                    x.Quantity,
                    x.ImageUrl,
                    x.IsActive,
                    CategoryId = x.FoodCategoryId,
                    CategoryName = x.FoodCategory.Name
                })
                .FirstOrDefaultAsync();

            if (food == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an."
                });
            }

            return Ok(food);
        }

        // POST: api/foods
        [HttpPost]
        public async Task<IActionResult> CreateFood(
            [FromBody] FoodRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu mon an khong hop le."
                });
            }

            var validation = await ValidateFoodRequest(request);

            if (validation != null)
            {
                return validation;
            }

            var food = new Food
            {
                Name = request.Name.Trim(),
                Price = request.Price,
                Quantity = request.Quantity,
                ImageUrl = request.ImageUrl?.Trim() ?? "",
                FoodCategoryId = request.CategoryId,
                IsActive = request.IsActive
            };

            _context.Foods.Add(food);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFood),
                new { id = food.Id },
                new
                {
                    message = "Them mon an thanh cong.",
                    food.Id,
                    food.Name,
                    food.Price,
                    food.Quantity,
                    food.ImageUrl,
                    food.IsActive,
                    CategoryId = food.FoodCategoryId
                });
        }

        // PUT: api/foods/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateFood(
            int id,
            [FromBody] FoodRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Du lieu mon an khong hop le."
                });
            }

            var food = await _context.Foods
                .FirstOrDefaultAsync(x => x.Id == id);

            if (food == null)
            {
                return NotFound(new
                {
                    message = "Khong tim thay mon an."
                });
            }

            var validation = await ValidateFoodRequest(request);

            if (validation != null)
            {
                return validation;
            }

            food.Name = request.Name.Trim();
            food.Price = request.Price;
            food.Quantity = request.Quantity;
            food.ImageUrl = request.ImageUrl?.Trim() ?? "";
            food.FoodCategoryId = request.CategoryId;
            food.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cap nhat mon an thanh cong.",
                food.Id,
                food.Name,
                food.Price,
                food.Quantity,
                food.ImageUrl,
                food.IsActive,
                CategoryId = food.FoodCategoryId
            });
        }

        // GET: api/foods/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.FoodCategories
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name
                })
                .ToListAsync();

            return Ok(categories);
        }

        // Kiem tra du lieu truoc khi them hoac cap nhat.
        private async Task<IActionResult?> ValidateFoodRequest(
            FoodRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new
                {
                    message = "Ten mon an khong duoc de trong."
                });
            }

            if (request.Price < 0)
            {
                return BadRequest(new
                {
                    message = "Gia mon an khong duoc am."
                });
            }

            if (request.Quantity < 0)
            {
                return BadRequest(new
                {
                    message = "So luong mon an khong duoc am."
                });
            }

            if (request.CategoryId <= 0)
            {
                return BadRequest(new
                {
                    message = "Vui long chon danh muc mon an."
                });
            }

            var categoryExists = await _context.FoodCategories
                .AnyAsync(x => x.Id == request.CategoryId);

            if (!categoryExists)
            {
                return BadRequest(new
                {
                    message = "Danh muc mon an khong ton tai."
                });
            }

            return null;
        }

        public class FoodRequest
        {
            public string Name { get; set; } = "";

            public decimal Price { get; set; }

            public int Quantity { get; set; }

            public string ImageUrl { get; set; } = "";

            public int CategoryId { get; set; }

            public bool IsActive { get; set; } = true;
        }
    }
}