
namespace backend.Models;

public class PasswordResetToken
{
    public int Id { get; set; }

    public int UserId { get; set; }

    // Chi luu hash cua token, khong luu token goc
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser? User { get; set; }
}
