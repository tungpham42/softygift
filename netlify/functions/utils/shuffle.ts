/**
 * Sattolo's algorithm - tạo một hoán vị dạng vòng lặp đơn (single cycle).
 * Đảm bảo:
 *  - Không ai bị gán tặng quà cho chính mình
 *  - Không xảy ra cặp đôi kín kiểu A tặng B và B tặng lại A (khi có >= 3 người)
 */
function sattoloShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // lưu ý: j chạy tới i-1, không phải i
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Trả về Map: giverId -> recipientId
 */
export function assignRecipients<T extends { id: string }>(
  participants: T[]
): Map<string, string> {
  if (participants.length < 3) {
    throw new Error("Cần tối thiểu 3 người tham gia để đảm bảo tính bí mật của trò chơi");
  }

  const shuffled = sattoloShuffle(participants);
  const assignment = new Map<string, string>();

  shuffled.forEach((giver, idx) => {
    const recipient = shuffled[(idx + 1) % shuffled.length];
    assignment.set(giver.id, recipient.id);
  });

  return assignment;
}
