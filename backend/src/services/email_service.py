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

