import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { taskApi } from '../../api/taskApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { getColors } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskStatus, TaskPriority } from '../../types/task';
import { useAuth } from '../../hooks/useAuth';
import { useRoute } from '@react-navigation/native';

type TaskFormScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface StatusOption {
  value: TaskStatus;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const statusOptions: StatusOption[] = [
  { value: 'in-progress', label: 'In Progress', icon: 'hourglass-empty' },
  { value: 'completed', label: 'Completed', icon: 'check-circle' },
  { value: 'expired', label: 'Expired', icon: 'error-outline' },
  { value: 'closed', label: 'Closed', icon: 'block' }
];
const priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

export const TaskFormScreen: React.FC = () => {
  const navigation = useNavigation<TaskFormScreenNavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const { user } = useAuth();
  const route = useRoute();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('in-progress');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [participants, setParticipants] = useState<Array<{ email: string; displayName: string }>>([]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a task');
      return;
    }

    try {
      setLoading(true);
      await taskApi.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate.toISOString(),
        createdBy: user,
        assignedTo: user,
        participants: [],
        subtasks: [],
        comments: [],
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const source = route.params?.source;
    if (source === 'calendar') {
      navigation.pop(2);
    } else {
      navigation.goBack();
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Task</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
      >
        <View style={styles.form}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.divider
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.secondaryText}
              maxLength={50}
            />
            <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
              {title.length}/50 characters
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.divider
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
              {description.length}/500 characters
            </Text>
          </View>

          {/* Status Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <TouchableOpacity 
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.divider
              }]}
              onPress={() => setShowStatusDropdown(true)}
            >
              <View style={styles.statusInputContent}>
                <MaterialIcons
                  name={
                    status === 'completed' ? 'check-circle' :
                    status === 'in-progress' ? 'schedule' :
                    status === 'expired' ? 'error' : 'close'
                  }
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.inputText, { color: colors.text }]}>
                  {status === 'in-progress' ? 'In Progress' :
                   status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.text} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Priority Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
            <TouchableOpacity 
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.divider
              }]}
              onPress={() => setShowPriorityDropdown(true)}
            >
              <View style={styles.statusInputContent}>
                <MaterialIcons
                  name={
                    priority === 'high' ? 'priority-high' :
                    priority === 'medium' ? 'star' : 'star-border'
                  }
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.inputText, { color: colors.text }]}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.text} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Due Date Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Due Date *</Text>
            <TouchableOpacity
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.divider
              }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateInputContent}>
                <Text style={[styles.inputText, { color: colors.text }]}>
                  {formatDate(dueDate)}
                </Text>
                <MaterialIcons name="calendar-today" size={22} color={colors.text} />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { 
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1 
            }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            {statusOptions.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.statusOption,
                  status === s.value && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => {
                  setStatus(s.value as TaskStatus);
                  setShowStatusDropdown(false);
                }}
              >
                <MaterialIcons
                  name={s.icon}
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Priority Dropdown Modal */}
      <Modal
        visible={showPriorityDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriorityDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowPriorityDropdown(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            {priorityOptions.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.statusOption,
                  priority === p && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => {
                  setPriority(p);
                  setShowPriorityDropdown(false);
                }}
              >
                <MaterialIcons
                  name={
                    p === 'high' ? 'priority-high' :
                    p === 'medium' ? 'star' : 'star-border'
                  }
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginTop: Platform.OS === 'ios' ? -8 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  statusInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 8,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  statusOptionText: {
    fontSize: 16,
  },
}); 