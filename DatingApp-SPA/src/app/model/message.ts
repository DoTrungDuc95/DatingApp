export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  senderKnowAs: string;
  recipientKnowAs: string;
  senderPhotoUrl: string;
  recipientPhotoUrl: string;
  content: string;
  isRead: boolean;
  dateRead: Date;
  messageSent: Date;
}
