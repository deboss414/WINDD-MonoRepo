import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Comment } from '@shared/types/comment.types';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

interface CommentSectionProps {
  subtaskId: string;
  comments: Comment[];
  onAddComment: (text: string, parentCommentId?: string) => void;
  onEditComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  subtaskId,
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [editingCommentId, setEditingCommentId] = useState<string | undefined>();
  const [editingText, setEditingText] = useState('');

  const safeComments = Array.isArray(comments) ? comments : [];
  
  // Build comment hierarchy from flat array
  const buildCommentHierarchy = (comments: Comment[]) => {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build the hierarchy
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  };

  const topLevelComments = buildCommentHierarchy(safeComments);

  const handleSubmitComment = () => {
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), replyToId);
    setNewCommentText('');
    setReplyToId(undefined);
  };

  const handleEditComment = (commentId: string, text: string) => {
    onEditComment(commentId, text);
    setEditingCommentId(undefined);
    setEditingText('');
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReply = depth > 0;

    return (
      <View key={comment.id} style={[styles.commentContainer, { marginLeft: depth * 20 }]}>
        {isReply && (
          <View style={[styles.threadLine, { backgroundColor: colors.divider }]} />
        )}
        <View style={[
          styles.commentContent,
          isReply && { backgroundColor: colors.cardBackground }
        ]}>
          <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(comment.author.firstName + comment.author.lastName) }]}>
            <Text style={styles.avatarText}>{getInitials(comment.author.firstName, comment.author.lastName)}</Text>
          </View>
          <View style={styles.commentMain}>
            <View style={styles.commentHeader}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {comment.author.firstName} {comment.author.lastName}
              </Text>
              <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && ' (edited)'}
              </Text>
            </View>

            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.divider,
                    },
                  ]}
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      handleEditComment(comment.id, editingText);
                    }}
                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.editButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingCommentId(undefined);
                      setEditingText('');
                    }}
                    style={[styles.editButton, { backgroundColor: colors.taskStatus.expired }]}
                  >
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  {comment.text}
                </Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() => setReplyToId(comment.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="reply" size={16} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingCommentId(comment.id);
                      setEditingText(comment.text);
                    }}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="edit" size={16} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteComment(comment.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={16} color={colors.taskStatus.expired} />
                    <Text style={[styles.actionText, { color: colors.taskStatus.expired }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.responses}>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>
          Comments ({comments.length})
        </Text>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.divider,
                },
              ]}
              placeholder={replyToId ? 'Write a reply...' : 'Write a comment...'}
              placeholderTextColor={colors.secondaryText}
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {replyToId && (
            <TouchableOpacity
              onPress={() => setReplyToId(undefined)}
              style={styles.cancelReply}
            >
              <MaterialIcons name="close" size={16} color={colors.secondaryText} />
              <Text style={[styles.cancelReplyText, { color: colors.secondaryText }]}>
                Cancel reply
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.commentsList}>
            {topLevelComments.map(comment => renderComment(comment))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelReply: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelReplyText: {
    marginLeft: 4,
    fontSize: 12,
  },
  commentsList: {
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  threadLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  commentContent: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  commentMain: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    minHeight: 80,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  responses: {
    marginTop: 8,
  },
}); 