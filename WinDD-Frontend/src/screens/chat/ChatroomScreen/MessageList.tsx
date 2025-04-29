import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MessageListProps } from './types';
import type { Message } from '../../../types/chat';

// Add color array for avatars
const avatarColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
  '#E67E22', // Orange
  '#2ECC71', // Emerald
];

const getAvatarColor = (name: string) => {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[index];
};

interface MessageLikes {
  [messageId: string]: Set<string>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onReplyPress,
  onEditPress,
  onDeletePress,
  colors,
  flatListRef,
  loading,
}) => {
  console.log('MessageList received messages:', messages);
  const [messageLikes, setMessageLikes] = useState<MessageLikes>({});
  const lastTapRef = useRef<{ [key: string]: number }>({});

  const handleDoubleTap = (messageId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[messageId] || 0;
    
    if (now - lastTap < 300) { // 300ms threshold for double tap
      setMessageLikes(prev => {
        const newLikes = { ...prev };
        if (!newLikes[messageId]) {
          newLikes[messageId] = new Set();
        }
        
        if (newLikes[messageId].has(currentUserId)) {
          newLikes[messageId].delete(currentUserId);
        } else {
          newLikes[messageId].add(currentUserId);
        }
        
        return newLikes;
      });
    }
    lastTapRef.current[messageId] = now;
  };

  const getLikeCount = (messageId: string): number => {
    return messageLikes[messageId]?.size || 0;
  };

  const hasUserLiked = (messageId: string): boolean => {
    return messageLikes[messageId]?.has(currentUserId) || false;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    console.log('Rendering message:', item);
    const isCurrentUser = item.senderId === currentUserId;
    const avatarColor = getAvatarColor(item.senderName);
    const likeCount = getLikeCount(item.id);
    const isLikedByUser = hasUserLiked(item.id);

    return (
      <Pressable
        onPress={() => handleDoubleTap(item.id)}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.messageContent}>
          {!isCurrentUser && (
            <Text style={[styles.senderName, { color: colors.secondaryText }]}>
              <Text style={styles.boldText}>{item.senderName}</Text>
            </Text>
          )}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isCurrentUser ? colors.primary : colors.cardBackground,
                borderTopLeftRadius: isCurrentUser ? 16 : 8,
                borderTopRightRadius: isCurrentUser ? 8 : 16,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              },
            ]}
          >
            {item.replyTo && (
              <View style={[
                styles.replyThread,
                { 
                  backgroundColor: isCurrentUser 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(0,0,0,0.05)',
                  borderLeftWidth: 3,
                  borderLeftColor: isCurrentUser 
                    ? 'rgba(255,255,255,0.3)' 
                    : colors.primary,
                }
              ]}>
                <View style={styles.replyHeader}>
                  <MaterialIcons 
                    name="reply" 
                    size={14} 
                    color={isCurrentUser ? 'rgba(255,255,255,0.9)' : colors.primary} 
                  />
                  <Text style={[styles.replyToText, { color: isCurrentUser ? 'rgba(255,255,255,0.9)' : colors.primary }]}>
                    Replied to <Text style={styles.boldText}>{item.replyTo.senderName}</Text>
                  </Text>
                </View>
                <Text style={[styles.replyContent, { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : colors.text }]}>
                  {item.replyTo.content}
                </Text>
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                { color: isCurrentUser ? '#fff' : colors.text },
              ]}
            >
              {item.content}
            </Text>
            <View style={[
              styles.messageFooter,
              { 
                borderTopColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            ]}>
              <View style={styles.messageFooterLeft}>
                <Text style={[styles.timestamp, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {likeCount > 0 && (
                  <View style={styles.likeContainer}>
                    <MaterialIcons 
                      name="favorite" 
                      size={14} 
                      color={isLikedByUser ? "#FF3B30" : colors.secondaryText}
                      style={styles.likeIcon}
                    />
                    <Text style={[styles.likeCount, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                      {likeCount}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.messageActions}>
                {isCurrentUser && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Message',
                        'Are you sure you want to delete this message?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => onDeletePress(item),
                          },
                        ]
                      );
                    }}
                  >
                    <MaterialIcons name="delete" size={16} color={isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.taskStatus.pending} />
                    <Text style={[styles.deleteButtonText, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.taskStatus.pending }]}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => onReplyPress(item)}
                >
                  <MaterialIcons name="reply" size={16} color={isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText} />
                  <Text style={[styles.replyButtonText, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {isCurrentUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  const ListHeaderComponent = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Loading messages...
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.messagesList,
        messages.length === 0 && styles.emptyContainer
      ]}
      onContentSizeChange={() => {
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
      showsVerticalScrollIndicator={false}
      inverted={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {!loading && (
            <>
              <MaterialIcons name="chat-bubble-outline" size={48} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No messages yet. Start the conversation!
              </Text>
            </>
          )}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 12,
    opacity: 0.7,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  replyButtonText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  messageFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  likeIcon: {
    marginRight: 2,
  },
  likeCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  boldText: {
    fontWeight: '600',
  },
  replyThread: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  replyToText: {
    fontSize: 12,
    fontWeight: '500',
  },
  replyContent: {
    fontSize: 13,
    marginLeft: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 