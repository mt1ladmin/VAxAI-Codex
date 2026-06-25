import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "notifications@mt1l.com";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "thesia@mt1l.com";

export interface PostNotificationPayload {
  action: "created" | "updated" | "published" | "scheduled";
  title: string;
  contentType: string;
  status: string;
  postId: string;
  slug: string;
  authorEmail?: string | null;
}

export async function sendPostNotification(payload: PostNotificationPayload): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping post notification");
    return;
  }

  const { action, title, contentType, status, postId, slug } = payload;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mt1l.com";
  const adminUrl = `${baseUrl}/admin/posts/${postId}`;

  const actionLabels: Record<PostNotificationPayload["action"], string> = {
    created: "New post created",
    updated: "Post updated",
    published: "Post published",
    scheduled: "Post scheduled",
  };

  const subject = `${actionLabels[action]}: ${title}`;

  const statusBadgeColor =
    status === "published" ? "#063b32" : status === "scheduled" ? "#b45309" : "#6b7280";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: sans-serif; color: #111111; margin: 0; padding: 0; background: #f7f4ea;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7f4ea; padding: 32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e1d4;">
        <tr>
          <td style="background: #063b32; padding: 20px 32px;">
            <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 700;">MT1L Content Hub</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #6f6b62; text-transform: uppercase; letter-spacing: 0.05em;">${actionLabels[action]}</p>
            <h1 style="margin: 0 0 20px; font-size: 22px; color: #111111;">${title}</h1>
            <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td style="padding-right: 16px; color: #6f6b62; font-size: 13px;">Type</td>
                <td style="font-size: 13px; font-weight: 600;">${contentType}</td>
              </tr>
              <tr>
                <td style="padding-right: 16px; color: #6f6b62; font-size: 13px; padding-top: 6px;">Slug</td>
                <td style="font-size: 13px; font-weight: 600; padding-top: 6px;">${slug}</td>
              </tr>
              <tr>
                <td style="padding-right: 16px; color: #6f6b62; font-size: 13px; padding-top: 6px;">Status</td>
                <td style="padding-top: 6px;">
                  <span style="display: inline-block; background: ${statusBadgeColor}; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.04em;">${status}</span>
                </td>
              </tr>
            </table>
            <a href="${adminUrl}" style="display: inline-block; background: #063b32; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">
              View in Admin →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 32px; border-top: 1px solid #e5e1d4; color: #9c9589; font-size: 11px;">
            This notification was sent automatically by the MT1L Content Hub.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send post notification:", err);
    // Non-fatal — don't throw
  }
}
