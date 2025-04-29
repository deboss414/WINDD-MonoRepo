import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ChatInputProps } from './types';

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  replyingTo,
  onCancelReply,
  colors,
  onAttachmentSelect,
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const handleAttachmentPress = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim(), replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.senderName,
      content: replyingTo.content
    } : undefined);
    setMessage('');
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset && asset.uri) {
          onAttachmentSelect?.('photo', asset.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset && asset.uri) {
          onAttachmentSelect?.('video', asset.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset && asset.uri) {
          onAttachmentSelect?.('file', asset.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleAttachmentOptionPress = async (type: 'photo' | 'video' | 'file') => {
    setShowAttachmentOptions(false);
    
    switch (type) {
      case 'photo':
        await pickImage();
        break;
      case 'video':
        await pickVideo();
        break;
      case 'file':
        await pickFile();
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {replyingTo && (
        <View style={[styles.replyContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.replyContent}>
            <MaterialIcons name="reply" size={16} color={colors.primary} />
            <Text style={[styles.replyText, { color: colors.text }]}>
              Replying to {replyingTo.senderName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCancelReply}
            style={styles.cancelReplyButton}
          >
            <MaterialIcons name="close" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          onPress={handleAttachmentPress}
          style={styles.attachButton}
        >
          <MaterialIcons name="attach-file" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondaryText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          style={[
            styles.sendButton,
            { opacity: message.trim() ? 1 : 0.5 },
          ]}
        >
          <MaterialIcons
            name="send"
            size={24}
            color={message.trim() ? colors.primary : colors.secondaryText}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAttachmentOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentOptions(false)}
        >
          <View style={[styles.attachmentOptions, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentOptionPress('photo')}
            >
              <MaterialIcons name="photo" size={24} color={colors.primary} />
              <Text style={[styles.attachmentOptionText, { color: colors.text }]}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentOptionPress('video')}
            >
              <MaterialIcons name="videocam" size={24} color={colors.primary} />
              <Text style={[styles.attachmentOptionText, { color: colors.text }]}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentOptionPress('file')}
            >
              <MaterialIcons name="insert-drive-file" size={24} color={colors.primary} />
              <Text style={[styles.attachmentOptionText, { color: colors.text }]}>File</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyText: {
    fontSize: 14,
  },
  cancelReplyButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  attachmentOptions: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  attachmentOptionText: {
    fontSize: 16,
  },
}); 