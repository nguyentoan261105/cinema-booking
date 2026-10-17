using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<ApplicationUser> _passwordHasher;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        IConfiguration configuration,
        EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _passwordHasher = new PasswordHasher<ApplicationUser>();
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

        string email = request.Email.Trim().ToLowerInvariant();
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
            Phone = phone,
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        // Bam mat khau truoc khi luu vao database
        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

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

        string email = request.Email.Trim().ToLowerInvariant();

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

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Tai khoan khong co mat khau hop le."
            });
        }

        bool passwordValid = false;
        bool isLegacyPassword = false;

        // -----------------------------------------------------
        // 1. Thu xac minh mat khau da duoc bam
        // -----------------------------------------------------
        try
        {
            var verifyResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (verifyResult == PasswordVerificationResult.Success ||
                verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                passwordValid = true;

                // Nang cap hash neu can
                if (verifyResult ==
                    PasswordVerificationResult.SuccessRehashNeeded)
                {
                    user.PasswordHash = _passwordHasher.HashPassword(
                        user,
                        request.Password
                    );

                    await _context.SaveChangesAsync();
                }
            }
        }
        catch (FormatException)
        {
            // Co the la du lieu mat khau cu dang van ban thuong
        }
        catch (ArgumentException)
        {
            // Hash cu khong dung dinh dang mong doi
        }

        // -----------------------------------------------------
        // 2. Tuong thich voi tai khoan cu luu mat khau thuong
        // -----------------------------------------------------
        if (!passwordValid &&
            string.Equals(
                user.PasswordHash,
                request.Password,
                StringComparison.Ordinal))
        {
            passwordValid = true;
            isLegacyPassword = true;
        }

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Email hoac mat khau khong chinh xac."
            });
        }

        // -----------------------------------------------------
        // 3. Chuyen tai khoan cu sang luu mat khau da bam
        // -----------------------------------------------------
        if (isLegacyPassword)
        {
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password
            );

            await _context.SaveChangesAsync();
        }

        // -----------------------------------------------------
        // 4. Tao JWT
        // -----------------------------------------------------
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
            out int configuredMinutes) &&
            configuredMinutes > 0)
        {
            expireMinutes = configuredMinutes;
        }

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                user.FullName
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

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

    private static string HashResetToken(string token)
    {
        byte[] bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(bytes);
    }

    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request)
    {
        const string genericMessage =
            "Neu email ton tai, ban se nhan duoc huong dan dat lai mat khau.";

        var email = request.Email.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        // Khong tiet lo email co ton tai hay khong.
        if (user == null)
        {
            return Ok(new { message = genericMessage });
        }

        var rawToken = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(32));

        var tokenHash = HashResetToken(rawToken);
        var now = DateTime.UtcNow;

        // Vo hieu hoa cac token chua su dung truoc do.
        var oldTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed)
            .ToListAsync();

        foreach (var oldToken in oldTokens)
        {
            oldToken.IsUsed = true;
        }

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(15),
            IsUsed = false
        };

        _context.PasswordResetTokens.Add(resetToken);
        await _context.SaveChangesAsync();

        var frontendBaseUrl = _configuration[
            "EmailSettings:FrontendBaseUrl"];

        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            throw new InvalidOperationException(
                "Chua cau hinh EmailSettings:FrontendBaseUrl.");
        }

        var resetUrl =
            $"{frontendBaseUrl.TrimEnd('/')}/ResetPassword.html" +
            $"?email={Uri.EscapeDataString(email)}" +
            $"&token={Uri.EscapeDataString(rawToken)}";

        try
        {
            await _emailService.SendPasswordResetEmailAsync(
                email, resetUrl);
        }
        catch
        {
            // Vo hieu hoa token neu gui email that bai.
            resetToken.IsUsed = true;
            await _context.SaveChangesAsync();

            // Ghi log loi o server; khong tra chi tiet SMTP cho client.
            return StatusCode(500, new
            {
                message = "Khong the gui email luc nay. Vui long thu lai sau."
            });
        }

        return Ok(new { message = genericMessage });
    }

    
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request)
    {
        var email = request.Email.Trim();
        var tokenHash = HashResetToken(request.Token);

        var now = DateTime.UtcNow;

        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == tokenHash &&
                !t.IsUsed &&
                t.ExpiresAt > now &&
                t.User != null &&
                t.User.Email == email);

        if (resetToken == null || resetToken.User == null)
        {
            return BadRequest(new
            {
                message = "Lien ket khong hop le, da het han hoac da duoc su dung."
            });
        }

        var user = resetToken.User;

        user.PasswordHash = _passwordHasher.HashPassword(
            user, request.NewPassword);

        resetToken.IsUsed = true;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Dat lai mat khau thanh cong."
        });
    }
}