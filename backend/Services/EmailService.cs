
using System.Net;
using System.Net.Mail;

namespace backend.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(
        string recipientEmail,
        string resetUrl)
    {
        var settings = _configuration.GetSection("EmailSettings");

        var smtpServer = settings["SmtpServer"]
            ?? throw new InvalidOperationException("Missing SMTP server.");

        var smtpPort = int.Parse(settings["SmtpPort"] ?? "587");

        var senderEmail = settings["SenderEmail"]
            ?? throw new InvalidOperationException("Missing sender email.");

        var username = settings["Username"]
            ?? throw new InvalidOperationException("Missing SMTP username.");

        var password = settings["Password"]
            ?? throw new InvalidOperationException("Missing SMTP password.");

        var senderName = settings["SenderName"] ?? "Cinema Booking";

        using var message = new MailMessage();
        message.From = new MailAddress(senderEmail, senderName);
        message.To.Add(recipientEmail);
        message.Subject = "Dat lai mat khau - Cinema Booking";
        message.IsBodyHtml = true;

        message.Body = $"""
            <div style="font-family:Arial,sans-serif;line-height:1.7">
                <h2>Dat lai mat khau</h2>
                <p>Chung toi nhan duoc yeu cau dat lai mat khau
                   cho tai khoan Cinema Booking cua ban.</p>
                <p>
                    <a href="{WebUtility.HtmlEncode(resetUrl)}"
                       style="display:inline-block;padding:12px 20px;
                       background:#ff4757;color:white;text-decoration:none;
                       border-radius:6px">
                        Dat lai mat khau
                    </a>
                </p>
                <p>Lien ket nay het han sau 15 phut va chi su dung
                   duoc mot lan.</p>
                <p>Neu ban khong gui yeu cau, hay bo qua email nay.</p>
            </div>
            """;

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(username, password)
        };

        await client.SendMailAsync(message);
    }
}
