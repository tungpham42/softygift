export interface ParticipantInput {
  name: string;
  email: string;
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  rules: string;
  deadline: string; // ISO string
  organizerEmail: string;
  participants: ParticipantInput[];
}

export interface CreateEventResult {
  eventId: string;
  participantCount: number;
  failedInvites?: number;
}

export interface AssignmentPerson {
  name: string;
  wishlist: string;
}

export interface AssignmentResponse {
  eventName: string;
  rules: string;
  deadline: string;
  me: AssignmentPerson;
  recipient: AssignmentPerson | null;
}
