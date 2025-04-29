import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task } from '../../types/task';
import { searchUserByEmail } from '../../services/UserService';

interface TaskInfoProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  onParticipantAdd: (email: string) => Promise<void>;
  onParticipantRemove: (email: string) => Promise<void>;
}

interface ParticipantSearchState {
  loading: boolean;
  error: string | null;
  foundUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const TaskInfo: React.FC<TaskInfoProps> = ({ 
  task, 
  onParticipantAdd,
  onParticipantRemove 
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [participantSearch, setParticipantSearch] = useState<ParticipantSearchState>({
    loading: false,
    error: null,
    foundUser: null
  });
  const INITIAL_PARTICIPANTS_SHOWN = 3;

  const formatDate = (dateString: string) => {
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    console.log('[TaskInfo] Formatting date:', { input: dateString, output: formattedDate });
    return formattedDate;
  };

  const handleEmailSearch = async (email: string) => {
    console.log('[TaskInfo] Searching for email:', email);
    if (!email.includes('@')) {
      console.log('[TaskInfo] Invalid email format');
      return;
    }
    
    setParticipantSearch(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await searchUserByEmail(email);
      console.log('[TaskInfo] Email search result:', result);
      if (result.exists && result.user) {
        setParticipantSearch({
          loading: false,
          error: null,
          foundUser: result.user
        });
      } else {
        setParticipantSearch({
          loading: false,
          error: result.message || 'User not found',
          foundUser: null
        });
      }
    } catch (error) {
      console.error('[TaskInfo] Email search error:', error);
      setParticipantSearch({
        loading: false,
        error: 'Error searching for user',
        foundUser: null
      });
    }
  };

  const handleAddParticipant = async () => {
    if (!participantSearch.foundUser) {
      setErrorMessage('User not found');
      return;
    }

    try {
      await onParticipantAdd(participantSearch.foundUser._id);
      setNewParticipant('');
      setParticipantSearch({
        loading: false,
        error: null,
        foundUser: null
      });
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleRemoveParticipant = async (email: string) => {
    await onParticipantRemove(email);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Description Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text 
          style={[styles.description, { color: colors.text }]}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {task.description || 'No description provided'}
        </Text>
        {task.description && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={[styles.readMore, { color: colors.primary }]}>
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date and Creator Section */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text} />
            <View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatDate(task.dueDate)}
              </Text>
              <Text style={[styles.labelText, { color: colors.secondaryText }]}>
                due date
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color={colors.text} />
            <View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {typeof task.createdBy === 'object' 
                  ? `${task.createdBy.firstName} ${task.createdBy.lastName}` 
                  : task.createdBy}
              </Text>
              <Text style={[styles.labelText, { color: colors.secondaryText }]}>
                admin
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Participants Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Participants</Text>
        {errorMessage ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorMessage}
          </Text>
        ) : null}
        <View style={styles.participantsList}>
          {(task.participants || []).slice(0, showAllParticipants ? undefined : INITIAL_PARTICIPANTS_SHOWN)
            .map((participant, index) => (
              <View key={index} style={styles.participantItem}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {participant.firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={[styles.participantText, { color: colors.text }]}>
                    {`${participant.firstName} ${participant.lastName}`}
                  </Text>
                  <Text style={[styles.participantEmail, { color: colors.secondaryText }]}>
                    {participant.email}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveParticipant(participant.email)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
        </View>
        {(task.participants || []).length > INITIAL_PARTICIPANTS_SHOWN && (
          <TouchableOpacity 
            onPress={() => setShowAllParticipants(!showAllParticipants)}
            style={styles.showAllButton}
          >
            <Text style={[styles.showAllText, { color: colors.primary }]}>
              {showAllParticipants ? 'Show Less' : `Show All (${(task.participants || []).length})`}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.addParticipantContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: participantSearch.foundUser ? colors.success : colors.secondaryText,
                backgroundColor: colors.background
              }]}
              placeholder="Add participant email"
              placeholderTextColor={colors.secondaryText}
              value={newParticipant}
              onChangeText={(text) => {
                setNewParticipant(text);
                if (text.includes('@')) {
                  handleEmailSearch(text);
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {participantSearch.loading && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
            )}
          </View>
          
          {participantSearch.error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {participantSearch.error}
            </Text>
          )}
          
          {participantSearch.foundUser && (
            <View style={styles.foundUserContainer}>
              <Text style={[styles.foundUserText, { color: colors.success }]}>
                Found: {participantSearch.foundUser.firstName} {participantSearch.foundUser.lastName}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.addButton, 
              { 
                backgroundColor: participantSearch.foundUser ? colors.primary : colors.disabled,
                opacity: participantSearch.foundUser ? 1 : 0.7
              }
            ]}
            onPress={handleAddParticipant}
            disabled={!participantSearch.foundUser}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  readMore: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  labelText: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  participantsList: {
    marginTop: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantInfo: {
    flex: 1,
  },
  participantText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  participantEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addParticipantContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  showAllButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 10,
  },
  foundUserContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  foundUserText: {
    fontSize: 14,
  }
});
