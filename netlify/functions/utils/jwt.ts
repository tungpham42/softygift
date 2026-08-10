import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export interface GiftTokenPayload {
  eventId: string;
  participantId: string;
}

/**
 * Ký token cho 1 người chơi. Token tự hết hạn đúng lúc deadline của sự kiện
 * (cộng thêm buffer để họ vẫn có thể xem lại sau khi hết hạn, nhưng không sửa được).
 */
export function signGiftToken(payload: GiftTokenPayload, deadline: Date): string {
  const bufferMs = 3 * 24 * 60 * 60 * 1000; // +3 ngày để vẫn xem được sau hạn chót
  const expiresInSeconds = Math.max(
    60,
    Math.floor((deadline.getTime() + bufferMs - Date.now()) / 1000)
  );
  return jwt.sign(payload, SECRET, { expiresIn: expiresInSeconds });
}

export function verifyGiftToken(token: string): GiftTokenPayload {
  return jwt.verify(token, SECRET) as GiftTokenPayload;
}
