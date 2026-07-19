import smtplib
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from ics import Calendar, Event
from datetime import datetime, timedelta
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = getattr(settings, "SMTP_SERVER", "")
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_username = getattr(settings, "SMTP_USERNAME", "")
        self.smtp_password = getattr(settings, "SMTP_PASSWORD", "")
        self.from_email = getattr(settings, "FROM_EMAIL", "noreply@hiresense.ai")
        self.mock_mode = not bool(self.smtp_server and self.smtp_username and self.smtp_password)

        if self.mock_mode:
            logger.warning("SMTP credentials not fully configured. EmailService running in mock mode.")

    def create_ics_file(self, title: str, start_time: datetime, duration_minutes: int, location: str = "", description: str = "") -> bytes:
        c = Calendar()
        e = Event()
        e.name = title
        e.begin = start_time
        e.duration = timedelta(minutes=duration_minutes)
        if location:
            e.location = location
        if description:
            e.description = description
        c.events.add(e)
        return str(c).encode('utf-8')

    def send_interview_invite(self, to_email: str, candidate_name: str, role: str, start_time: datetime, duration_minutes: int, meeting_link: str):
        subject = f"Interview Invitation: {role} at HireSense"
        
        body = f"""
        Hi {candidate_name},
        
        We are excited to invite you to an interview for the {role} position.
        
        Time: {start_time.strftime('%Y-%m-%d %H:%M:%S UTC')}
        Duration: {duration_minutes} minutes
        Meeting Link: {meeting_link}
        
        Please find the attached calendar invitation.
        
        Best regards,
        HireSense Recruiting Team
        """

        if self.mock_mode:
            logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject} | Body: {body}")
            return True

        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email

        msg.attach(MIMEText(body, 'plain'))

        # Attach ICS
        ics_content = self.create_ics_file(
            title=f"Interview: {role}",
            start_time=start_time,
            duration_minutes=duration_minutes,
            location=meeting_link,
            description=f"Video interview for {role}. Link: {meeting_link}"
        )
        
        part = MIMEApplication(ics_content, Name="invite.ics")
        part['Content-Disposition'] = 'attachment; filename="invite.ics"'
        msg.attach(part)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            logger.info(f"Successfully sent interview invite to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

email_service = EmailService()
