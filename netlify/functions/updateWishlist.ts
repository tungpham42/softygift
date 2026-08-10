import type { Handler } from "@netlify/functions";
import { db } from "./utils/firebaseAdmin";
import { verifyGiftToken } from "./utils/jwt";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { token, wishlist } = JSON.parse(event.body || "{}");

    if (!token || typeof wishlist !== "string") {
      return { statusCode: 400, body: JSON.stringify({ error: "Thiếu dữ liệu" }) };
    }
    if (wishlist.length > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Wishlist quá dài" }) };
    }

    const payload = verifyGiftToken(token);

    const eventDoc = await db.collection("events").doc(payload.eventId).get();
    if (!eventDoc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Không tìm thấy sự kiện" }) };
    }

    const eventData = eventDoc.data()!;
    const deadline: Date | undefined = eventData.deadline?.toDate
      ? eventData.deadline.toDate()
      : eventData.deadline
      ? new Date(eventData.deadline)
      : undefined;

    if (deadline && new Date() > deadline) {
      return { statusCode: 403, body: JSON.stringify({ error: "Đã quá hạn chót, không thể sửa wishlist" }) };
    }

    await db.collection("participants").doc(payload.participantId).update({
      wishlist,
      wishlistUpdatedAt: new Date(),
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Link không hợp lệ hoặc đã hết hạn" }),
    };
  }
};
