import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { SubTask, User } from '../../types/task';
import Slider from '@react-native-community/slider';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

interface SubTaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'createdBy'>) => void;
  participants: User[];
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  initialData?: SubTask;
}

export const SubTaskFormModal: React.FC<SubTaskFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  participants,
  isSubmitting,
  mode = 'create',
  initialData,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  const colors = getColors(colorScheme);
  const iconColor = isDark ? '#ECEDEE' : '#11181C';
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const isFormSubmitting = localIsSubmitting || isSubmitting;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<User | null>(null);
  const [assigneeSearchText, setAssigneeSearchText] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progress, setProgress] = useState(0);

  const filteredParticipants = (participants || []).filter(
    participant =>
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes((assigneeSearchText || '').toLowerCase()) &&
      (!assignee || participant.id !== assignee.id)
  );

  useEffect(() => {
    if (visible) {
      if (initialData) {
        console.log('Edit mode - Initial Data:', initialData);
        console.log('Edit mode - Participants:', participants);
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setAssignee(initialData.assignedTo || null);
        setDueDate(new Date(initialData.dueDate));
        setProgress(initialData.progress);
      } else {
        console.log('Create mode - Participants:', participants);
        resetForm();
      }
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialData, slideAnim, fadeAnim]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee(null);
    setDueDate(new Date());
    setProgress(0);
    setShowDatePicker(false);
    setLocalIsSubmitting(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDatePickerDone = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
  };

  const handleAddAssignee = (participant: User) => {
    setAssignee(participant);
    setAssigneeSearchText('');
    setShowAssigneeDropdown(false);
  };

  const handleRemoveAssignee = () => {
    setAssignee(null);
    setAssigneeSearchText('');
    setShowAssigneeDropdown(true);
  };

  const handleAssigneeSearch = (text: string) => {
    setAssigneeSearchText(text);
    setShowAssigneeDropdown(true);
  };

  const handleSubmit = async () => {
    if (isFormSubmitting) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLocalIsSubmitting(true);
      // Set the time to 00:00
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const subtaskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'createdBy'> = {
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignee || undefined,
        dueDate: selectedDate.toISOString(),
        progress,
        status: 'in-progress',
        priority: 'medium'
      };
      await onSubmit(subtaskData);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create subtask. Please try again.');
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  const handleBackdropPress = () => {
    if (!isFormSubmitting) {
      setShowDatePicker(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => !isFormSubmitting && onClose()}
      animationType="none"
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'create' ? 'Create Subtask' : 'Edit Subtask'}
              </Text>
              <TouchableOpacity
                onPress={handleBackdropPress}
                disabled={isFormSubmitting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={28} color={iconColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.divider,
                    },
                  ]}
                  placeholder="Enter subtask title"
                  placeholderTextColor={colors.secondaryText}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={50}
                  editable={!isFormSubmitting}
                />
                <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
                  {title.length}/50 characters
                </Text>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.divider,
                    },
                  ]}
                  placeholder="Enter subtask description"
                  placeholderTextColor={colors.secondaryText}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isFormSubmitting}
                />
              </View>

              {/* Assignees */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Assignee</Text>
                {assignee && (
                  <View style={[styles.selectedAssignee, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.assigneeText, { color: colors.text }]}>
                      {`${assignee.firstName} ${assignee.lastName}`}
                    </Text>
                    <TouchableOpacity
                      onPress={handleRemoveAssignee}
                      style={styles.removeAssigneeButton}
                      disabled={isFormSubmitting}
                    >
                      <MaterialIcons name="close" size={18} color={iconColor} />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.assigneeContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.divider,
                      },
                    ]}
                    placeholder="Search assignees..."
                    placeholderTextColor={colors.secondaryText}
                    value={assigneeSearchText}
                    onChangeText={handleAssigneeSearch}
                    onFocus={() => {
                      setShowAssigneeDropdown(true);
                      if (participants?.length > 0) {
                        setAssigneeSearchText('');
                      }
                    }}
                    editable={!isFormSubmitting}
                  />
                  {showAssigneeDropdown && (
                    <View
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredParticipants.map((participant) => (
                          <TouchableOpacity
                            key={participant.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleAddAssignee(participant);
                              setAssigneeSearchText('');
                              setShowAssigneeDropdown(false);
                            }}
                            disabled={isFormSubmitting}
                          >
                            <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                              {`${participant.firstName} ${participant.lastName}`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Due Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isFormSubmitting}
                >
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {formatDate(dueDate)}
                  </Text>
                  <MaterialIcons name="event" size={24} color={iconColor} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity
                      style={[styles.datePickerButton, { backgroundColor: colors.primary }]}
                      onPress={handleDatePickerDone}
                    >
                      <Text style={[styles.datePickerButtonText, { color: colors.background }]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Progress */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Progress</Text>
                <View style={styles.progressContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={progress}
                    onValueChange={setProgress}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.divider}
                    thumbTintColor={colors.primary}
                    disabled={isFormSubmitting}
                  />
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {progress}%
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isFormSubmitting ? 0.5 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isFormSubmitting}
              >
                <Text style={[styles.submitButtonText, { color: colors.background }]}>
                  {mode === 'create' ? 'Create Subtask' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  form: {
    flexGrow: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
  },
  assigneeText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  removeAssigneeButton: {
    padding: 2,
  },
  assigneeContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  datePickerButton: {
    padding: 4,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});