using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // =========================================================
    // REGISTER
    // =========================================================
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap ho ten."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap email."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Phone))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap so dien thoai."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap mat khau."
            });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new
            {
                success = false,
                message = "Mat khau phai co it nhat 6 ky tu."
            });
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new
            {
                success = false,
                message = "Mat khau xac nhan khong trung khop."
            });
        }

        string email = request.Email.Trim().ToLower();
        string phone = request.Phone.Trim();

        bool emailExists = await _context.Users
            .AnyAsync(x => x.Email.ToLower() == email);

        if (emailExists)
        {
            return BadRequest(new
            {
                success = false,
                message = "Email nay da duoc dang ky."
            });
        }

        bool phoneExists = await _context.Users
            .AnyAsync(x => x.Phone == phone);

        if (phoneExists)
        {
            return BadRequest(new
            {
                success = false,
                message = "So dien thoai nay da duoc dang ky."
            });
        }

        var user = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = request.Password,
            Phone = phone,
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Dang ky tai khoan thanh cong.",
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role,
                isActive = user.IsActive
            }
        });
    }

    // =========================================================
    // LOGIN
    // =========================================================
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap email."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                success = false,
                message = "Vui long nhap mat khau."
            });
        }

        string email = request.Email.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (user == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Email hoac mat khau khong chinh xac."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Tai khoan cua ban dang bi khoa."
            });
        }

        // =====================================================
        // HIEN TAI PROJECT DANG LUU PASSWORD TRUC TIEP
        // =====================================================
        if (user.PasswordHash != request.Password)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Email hoac mat khau khong chinh xac."
            });
        }

        // =====================================================
        // TAO JWT
        // =====================================================
        string token = GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            message = "Dang nhap thanh cong.",

            token = token,

            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role,
                isActive = user.IsActive
            }
        });
    }

    // =========================================================
    // TAO JWT TOKEN
    // =========================================================
    private string GenerateJwtToken(ApplicationUser user)
    {
        var key = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException(
                "Jwt:Key chua duoc cau hinh."
            );
        }

        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var expireMinutesString =
            _configuration["Jwt:ExpireMinutes"];

        int expireMinutes = 120;

        if (int.TryParse(
            expireMinutesString,
            out int configuredMinutes))
        {
            expireMinutes = configuredMinutes;
        }

        var claims = new List<Claim>
        {
            // ID cua tai khoan
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            // Ho ten
            new Claim(
                ClaimTypes.Name,
                user.FullName
            ),

            // Email
            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            // Role
            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    // =========================================================
    // REQUEST REGISTER
    // =========================================================
    public class RegisterRequest
    {
        public string FullName { get; set; } = "";

        public string Email { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Password { get; set; } = "";

        public string ConfirmPassword { get; set; } = "";
    }

    // =========================================================
    // REQUEST LOGIN
    // =========================================================
    public class LoginRequest
    {
        public string Email { get; set; } = "";

        public string Password { get; set; } = "";
    }
}