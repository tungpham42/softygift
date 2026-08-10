import type { Handler } from "@netlify/functions";
import { db } from "./utils/firebaseAdmin";
import { assignRecipients } from "./utils/shuffle";
import { signGiftToken } from "./utils/jwt";
import { sendInviteEmail } from "./utils/mailer";

interface ParticipantInput {
  name: string;
  email: string;
}

interface CreateEventBody {
  name: string;
  description?: string;
  rules: string;
  deadline: string; // ISO string
  organizerEmail: string;
  participants: ParticipantInput[];
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body: CreateEventBody = JSON.parse(event.body || "{}");

    if (!body.name || !body.rules || !body.deadline || !body.organizerEmail) {
      return { statusCode: 400, body: JSON.stringify({ error: "Thiếu thông tin sự kiện" }) };
    }
    if (!Array.isArray(body.participants) || body.participants.length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Cần tối thiểu 3 người tham gia" }),
      };
    }

    const emails = body.participants.map((p) => p.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "Có email bị trùng trong danh sách" }) };
    }

    const deadline = new Date(body.deadline);
    if (isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) {
      return { statusCode: 400, body: JSON.stringify({ error: "Hạn chót không hợp lệ" }) };
    }

    // 1. Tạo document sự kiện
    const eventRef = await db.collection("events").add({
      name: body.name,
      description: body.description || "",
      rules: body.rules,
      deadline,
      organizerEmail: body.organizerEmail,
      status: "active",
      createdAt: new Date(),
    });

    // 2. Tạo document cho từng người tham gia
    const participantsCol = db.collection("participants");
    const createBatch = db.batch();
    const participantDocs = body.participants.map((p) => {
      const ref = participantsCol.doc();
      createBatch.set(ref, {
        eventId: eventRef.id,
        name: p.name,
        email: p.email,
        assignedRecipientId: null,
        wishlist: "",
        wishlistUpdatedAt: null,
        inviteSentAt: null,
      });
      return { id: ref.id, name: p.name, email: p.email };
    });
    await createBatch.commit();

    // 3. Xáo trộn và gán người nhận cho từng người tặng
    const assignment = assignRecipients(participantDocs);
    const assignBatch = db.batch();
    assignment.forEach((recipientId, giverId) => {
      assignBatch.update(participantsCol.doc(giverId), {
        assignedRecipientId: recipientId,
      });
    });
    await assignBatch.commit();

    // 4. Gửi email mời kèm link mã hoá riêng cho từng người
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const deadlineText = deadline.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const results = await Promise.allSettled(
      participantDocs.map(async (p) => {
        const token = signGiftToken({ eventId: eventRef.id, participantId: p.id }, deadline);
        const link = `${appUrl}/gift?token=${encodeURIComponent(token)}`;
        await sendInviteEmail({
          to: p.email,
          participantName: p.name,
          eventName: body.name,
          deadlineText,
          link,
        });
        await participantsCol.doc(p.id).update({ inviteSentAt: new Date() });
      })
    );

    const failedCount = results.filter((r) => r.status === "rejected").length;

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventId: eventRef.id,
        participantCount: participantDocs.length,
        failedInvites: failedCount,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Có lỗi xảy ra khi tạo sự kiện, vui lòng thử lại" }),
    };
  }
};
