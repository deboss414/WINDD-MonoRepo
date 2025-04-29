import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../../constants/colors';
import { chatApi } from '../../api/chatApi';
import type { Conversation, Message } from '../../types/chat';
import type { ChatStackParamList } from '../../navigation/ChatNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { TaskStatus } from '../../types/task';

type ConversationsListScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'ConversationsList'>;

// Cache to store preloaded messages
const messageCache = new Map<string, Message[]>();
const CACHE_STORAGE_KEY = '@chat_message_cache';

const loadCacheFromStorage = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      Object.entries(parsedCache).forEach(([key, value]) => {
        messageCache.set(key, value as Message[]);
      });
    }
  } catch (error) {
    console.error('Failed to load message cache:', error);
  }
};

const saveCacheToStorage = async () => {
  try {
    const cacheObject: Record<string, Message[]> = {};
    messageCache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Failed to save message cache:', error);
  }
};

export const ConversationsListScreen: React.FC = () => {
  const navigation = useNavigation<ConversationsListScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('in-progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [isFirstLoad] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const preloadMessages = async (conversationId: string) => {
    try {
      if (messageCache.has(conversationId)) {
        return;
      }

      const conversationData = await chatApi.getConversation(conversationId);
      messageCache.set(conversationId, conversationData.messages || []);
      await saveCacheToStorage();
    } catch (error) {
      console.error(`Failed to preload messages for conversation ${conversationId}:`, error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      await loadCacheFromStorage();
      
      const data = await chatApi.getConversations();
      if (data && Array.isArray(data)) {
        // Transform _id to id for each conversation
        const transformedData = data.map(conversation => ({
          ...conversation,
          id: conversation._id || conversation.id
        }));
        
        setConversations(transformedData);
        
        // Only preload messages for conversations with valid IDs
        transformedData.forEach(conversation => {
          if (conversation.id) {
            preloadMessages(conversation.id);
          }
        });
      } else {
        setError('Invalid conversations data received');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    if (!conversation.id) {
      console.error('No conversation ID available:', conversation);
      return;
    }

    navigation.navigate('Chatroom', {
      conversationId: conversation.id,
      taskId: conversation.taskId,
      taskTitle: conversation.taskTitle,
      taskStatus: conversation.taskStatus,
      preloadedMessages: messageCache.get(conversation.id) || [],
      isFirstLoad,
      participants: conversation.participants
    });
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesStatus = activeTab === 'all' || conversation.taskStatus === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || (
      conversation.taskTitle.toLowerCase().includes(searchLower) ||
      conversation.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower)
    );
    return matchesStatus && matchesSearch;
  });

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: colors.taskStatus[item.taskStatus as keyof typeof colors.taskStatus] || colors.secondaryText }
            ]} />
            <Text 
              style={[styles.taskTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.taskTitle}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
            {new Date(item.updatedAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text 
            style={[styles.lastMessage, { color: colors.secondaryText }]}
            numberOfLines={1}
          >
            {item.lastMessage ? (
              <>
                <Text style={{ fontWeight: '600' }}>{item.lastMessage.senderName}: </Text>
                {item.lastMessage.content}
              </>
            ) : (
              'Start the conversation...'
            )}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.divider
          }]}
          placeholder="Search conversations..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowFilter(true)}
        >
          <MaterialIcons name="filter-list" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.newChatButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('TaskSelection')}
        >
          <MaterialIcons name="chat" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => {
          if (!item.id) {
            console.warn('Conversation missing id:', item);
            return Math.random().toString(); // Fallback for missing ids
          }
          return item.id;
        }}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Conversations</Text>
            {(['all', 'in-progress', 'completed', 'expired', 'closed'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  activeTab === status && { backgroundColor: `${colors.primary}15` }
                ]}
                onPress={() => {
                  setActiveTab(status);
                  setShowFilter(false);
                }}
              >
                <Text style={[styles.filterOptionText, { color: colors.text }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                {activeTab === status && (
                  <MaterialIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 16,
    borderWidth: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  conversationContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});