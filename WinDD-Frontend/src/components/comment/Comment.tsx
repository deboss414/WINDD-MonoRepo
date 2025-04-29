import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Comment as CommentType } from '../../types/comment';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface CommentProps {
  comment: CommentType;
  onEdit: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  isReply?: boolean;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  isReply = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const handleEdit = () => {
    if (editedText.trim() && editedText !== comment.text) {
      onEdit(comment.id, editedText);
    }
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <View style={styles.header}>
        <Text style={styles.author}>
          {comment.author.firstName} {comment.author.lastName}
        </Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          {comment.isEdited && ' (edited)'}
        </Text>
      </View>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editedText}
            onChangeText={setEditedText}
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.text}>{comment.text}</Text>
      )}

      {!isEditing && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onReply(comment.id)} style={styles.actionButton}>
            <Ionicons name="arrow-undo" size={16} color={colors.text.secondary} />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
            <Ionicons name="pencil" size={16} color={colors.text.secondary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.actionButton}>
            <Ionicons name="trash" size={16} color={colors.text.secondary} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyContainer: {
    marginLeft: 16,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  text: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  repliesContainer: {
    marginTop: 8,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  editButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: colors.text.primary,
  },
}); 