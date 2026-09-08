import logging
import os
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("spond.email")


class EmailService:
    """Service for sending emails. Uses standard Python smtplib with Gmail."""

    def _send_sync_email(self, to_email: str, otp: str, purpose: str) -> None:
        from dotenv import load_dotenv
        load_dotenv()
        
        smtp_email = os.environ.get("SMTP_EMAIL")
        smtp_password = os.environ.get("SMTP_PASSWORD")
        
        if not smtp_email or not smtp_password:
            logger.warning(f"SMTP credentials missing. Mock Email to {to_email} | OTP: {otp}")
            return
            
        try:
            msg = MIMEMultipart()
            msg["From"] = smtp_email
            msg["To"] = to_email
            msg["Subject"] = "Your Verification Code (Spond)"

            body = f"Your verification code for {purpose} is: {otp}\n\nThis code will expire soon. Do not share it with anyone."
            msg.attach(MIMEText(body, "plain"))

            # Standard Gmail SMTP connection
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(smtp_email, smtp_password)
                server.send_message(msg)
            
            logger.info(f"Successfully sent real OTP email to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")

    async def send_otp_email(self, to_email: str, otp: str, purpose: str) -> None:
        """
        Sends an OTP email without blocking the async event loop.
        """
        await asyncio.to_thread(self._send_sync_email, to_email, otp, purpose)

    def _send_sync_group_invite_email(
        self,
        to_email: str,
        member_name: str,
        admin_name: str,
        group_name: str,
        invite_token: str
    ) -> None:
        from dotenv import load_dotenv
        load_dotenv(override=True)

        smtp_email = os.environ.get("SMTP_EMAIL")
        smtp_password = os.environ.get("SMTP_PASSWORD")

        if not smtp_email or not smtp_password:
            logger.warning(f"SMTP credentials missing. Mock Group Invite to {to_email} for group {group_name}")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"Spond <{smtp_email}>"
            msg["To"] = to_email
            msg["Subject"] = f"Invitation: {admin_name} invited you to join {group_name} on Spond"

            backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
            accept_url = f"{backend_url}/api/v1/sports/groups/invite/respond?token={invite_token}&action=accept"
            reject_url = f"{backend_url}/api/v1/sports/groups/invite/respond?token={invite_token}&action=reject"

            text_body = (
                f"Hey {member_name},\n\n"
                f"{admin_name} has invited you to join '{group_name}' on Spond.\n\n"
                f"Accept: {accept_url}\n"
                f"Reject: {reject_url}\n\n"
                f"Thank you,\nSpond Team"
            )

            html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 40px 20px; }}
    .container {{ max-width: 520px; margin: 0 auto; background-color: #131b2e; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }}
    .logo {{ font-size: 22px; font-weight: 800; color: #f43f5e; text-align: center; margin-bottom: 24px; letter-spacing: 1px; }}
    .greeting {{ font-size: 19px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }}
    .text {{ font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }}
    .group-box {{ background-color: #0b1120; border-radius: 12px; padding: 18px 20px; border: 1px solid #1e293b; margin-bottom: 28px; }}
    .group-title {{ font-size: 17px; font-weight: 700; color: #f8fafc; }}
    .group-sub {{ font-size: 13px; color: #64748b; margin-top: 4px; }}
    .btn-wrap {{ text-align: center; margin-bottom: 24px; }}
    .btn {{ display: inline-block; padding: 12px 26px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 0 6px; }}
    .btn-accept {{ background-color: #10b981; color: #ffffff !important; }}
    .btn-reject {{ background-color: #27354f; color: #cbd5e1 !important; border: 1px solid #334155; }}
    .footer {{ text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SPOND</div>
    <div class="greeting">Hey {member_name}!</div>
    <p class="text">
      <strong>{admin_name}</strong> has invited you to join their sports group on Spond.
    </p>
    <div class="group-box">
      <div class="group-title">🏆 {group_name}</div>
      <div class="group-sub">Invited by: {admin_name} (Club Owner)</div>
    </div>
    <div class="btn-wrap">
      <a href="{accept_url}" class="btn btn-accept">✓ Accept</a>
      <a href="{reject_url}" class="btn btn-reject">✕ Reject</a>
    </div>
    <div class="footer">
      If you did not expect this invitation, you can safely decline or ignore this email.
    </div>
  </div>
</body>
</html>"""

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(smtp_email, smtp_password)
                server.send_message(msg)

            logger.info(f"Successfully sent invitation email to {to_email} for group {group_name}")
        except Exception as e:
            logger.error(f"Failed to send invite email to {to_email}: {str(e)}")

    async def send_group_invite_email(
        self,
        to_email: str,
        member_name: str,
        admin_name: str,
        group_name: str,
        invite_token: str
    ) -> None:
        """
        Sends group invitation email asynchronously without blocking.
        """
        await asyncio.to_thread(
            self._send_sync_group_invite_email,
            to_email,
            member_name,
            admin_name,
            group_name,
            invite_token
        )

    def _send_sync_password_reset_email(
        self,
        to_email: str,
        reset_url: str,
        user_name: str = "User"
    ) -> None:
        from dotenv import load_dotenv
        load_dotenv(override=True)

        smtp_email = os.environ.get("SMTP_EMAIL")
        smtp_password = os.environ.get("SMTP_PASSWORD")

        if not smtp_email or not smtp_password:
            logger.warning(f"SMTP credentials missing. Mock Password Reset to {to_email} with url {reset_url}")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"Spond <{smtp_email}>"
            msg["To"] = to_email
            msg["Subject"] = "Reset Your Spond Password"

            text_body = (
                f"Hello {user_name},\n\n"
                f"We received a request to reset your password for your Spond account.\n\n"
                f"Reset Link: {reset_url}\n\n"
                f"This link is valid for 30 minutes. If you did not request a password reset, please ignore this email.\n\n"
                f"Thank you,\nSpond Team"
            )

            html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 40px 20px; }}
    .container {{ max-width: 520px; margin: 0 auto; background-color: #131b2e; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }}
    .logo {{ font-size: 22px; font-weight: 800; color: #f43f5e; text-align: center; margin-bottom: 24px; letter-spacing: 1px; }}
    .greeting {{ font-size: 19px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }}
    .text {{ font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }}
    .btn-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 13px 32px; border-radius: 9999px; font-size: 15px; font-weight: 700; text-decoration: none; background: linear-gradient(135deg, #FF5E8A 0%, #FF3366 100%); color: #ffffff !important; box-shadow: 0 4px 14px rgba(255, 51, 102, 0.4); }}
    .link-alt {{ font-size: 12px; color: #64748b; word-break: break-all; margin-top: 16px; }}
    .footer {{ text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SPOND</div>
    <div class="greeting">Hello {user_name},</div>
    <p class="text">
      We received a request to reset your password for your Spond account. Click the button below to choose a new password.
    </p>
    <div class="btn-wrap">
      <a href="{reset_url}" class="btn">Reset Password</a>
    </div>
    <p class="text">
      This password reset link will expire in <strong>30 minutes</strong>.
    </p>
    <div class="link-alt">
      Or copy and paste this URL into your browser:<br/>
      <a href="{reset_url}" style="color: #FF5E8A;">{reset_url}</a>
    </div>
    <div class="footer">
      If you did not request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.
    </div>
  </div>
</body>
</html>"""

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(smtp_email, smtp_password)
                server.send_message(msg)

            logger.info(f"Successfully sent password reset email to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_url: str,
        user_name: str = "User"
    ) -> None:
        """
        Sends password reset email asynchronously without blocking.
        """
        await asyncio.to_thread(
            self._send_sync_password_reset_email,
            to_email,
            reset_url,
            user_name
        )


