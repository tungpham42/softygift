import type {
  AssignmentResponse,
  CreateEventPayload,
  CreateEventResult,
} from "../types";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại");
  }
  return data as T;
}

export async function createEvent(payload: CreateEventPayload): Promise<CreateEventResult> {
  const res = await fetch("/api/createEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<CreateEventResult>(res);
}

export async function getAssignment(token: string): Promise<AssignmentResponse> {
  const res = await fetch(`/api/getAssignment?token=${encodeURIComponent(token)}`);
  return handleResponse<AssignmentResponse>(res);
}

export async function updateWishlist(token: string, wishlist: string): Promise<{ ok: true }> {
  const res = await fetch("/api/updateWishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, wishlist }),
  });
  return handleResponse<{ ok: true }>(res);
}
