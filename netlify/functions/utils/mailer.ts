import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

interface SendInviteParams {
  to: string;
  participantName: string;
  eventName: string;
  deadlineText: string;
  link: string;
}

export async function sendInviteEmail(params: SendInviteParams) {
  const { to, participantName, eventName, deadlineText, link } = params;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${eventName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `You have been invited to join "${eventName}"`,
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
        <h2 style="margin-bottom: 4px;">Hello ${participantName},</h2>
        <p>You have been added to the gift exchange event <strong>${eventName}</strong>.</p>
        <p>Deadline to fill in information: <strong>${deadlineText}</strong></p>
        <p>Click the button below to see who you need to give a gift to and fill in your wishlist so the gift giver knows what to buy:</p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="background:#1677ff;color:#fff;padding:12px 24px;border-radius:8px;
                    text-decoration:none;display:inline-block;font-weight:500;">
            View My Information
          </a>
        </p>
        <p style="color:#888;font-size:12px;">
          This link is only for you, please do not share it with others.
        </p>
      </div>
    `,
  });
}
