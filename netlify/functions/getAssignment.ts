import type { Handler } from "@netlify/functions";
import { db } from "./utils/firebaseAdmin";
import { verifyGiftToken } from "./utils/jwt";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const token = event.queryStringParameters?.token;
  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ error: "Thiếu token" }) };
  }

  try {
    const payload = verifyGiftToken(token);

    const [eventDoc, meDoc] = await Promise.all([
      db.collection("events").doc(payload.eventId).get(),
      db.collection("participants").doc(payload.participantId).get(),
    ]);

    if (!eventDoc.exists || !meDoc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Không tìm thấy dữ liệu" }) };
    }

    const eventData = eventDoc.data()!;
    const me = meDoc.data()!;

    let recipient = null;
    if (me.assignedRecipientId) {
      const recipientDoc = await db.collection("participants").doc(me.assignedRecipientId).get();
      if (recipientDoc.exists) {
        const r = recipientDoc.data()!;
        recipient = { name: r.name, wishlist: r.wishlist || "" };
      }
    }

    const deadline = eventData.deadline?.toDate ? eventData.deadline.toDate() : eventData.deadline;

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventName: eventData.name,
        rules: eventData.rules,
        deadline: deadline instanceof Date ? deadline.toISOString() : deadline,
        me: { name: me.name, wishlist: me.wishlist || "" },
        recipient,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Link không hợp lệ hoặc đã hết hạn" }),
    };
  }
};
