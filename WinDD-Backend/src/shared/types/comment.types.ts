export interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  parentComment?: string;
  isEdited: boolean;
  subtask: string;
  replies?: Comment[];
}

export interface CommentFormData {
  text: string;
  subtaskId: string;
  parentCommentId?: string;
} 