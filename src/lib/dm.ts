/** Ordina partecipanti per vincolo DB (participant_a < participant_b). */
export function dmParticipants(
  userId: string,
  otherId: string,
): { participant_a: string; participant_b: string } {
  if (userId < otherId) {
    return { participant_a: userId, participant_b: otherId };
  }
  return { participant_a: otherId, participant_b: userId };
}

export function otherParticipant(
  conversation: { participant_a: string; participant_b: string },
  myId: string,
): string {
  return conversation.participant_a === myId
    ? conversation.participant_b
    : conversation.participant_a;
}
