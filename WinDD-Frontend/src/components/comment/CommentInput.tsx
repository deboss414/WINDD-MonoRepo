import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';
import { commentStyles } from './styles';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialText?: string;
  showCancel?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialText = '',
  showCancel = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [text, setText] = useState(initialText);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View style={commentStyles.container}>
      <TextInput
        style={[
          commentStyles.input,
          {
            backgroundColor: colorScheme === 'dark' ? colors.cardBackground : colors.background,
            color: colors.text,
            borderColor: colors.divider,
            opacity: 1,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={text}
        onChangeText={setText}
        multiline
      />
      <View style={commentStyles.actions}>
        {showCancel && onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={[commentStyles.button, commentStyles.cancelButton, { backgroundColor: colors.divider }]}
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[commentStyles.button, commentStyles.submitButton, { backgroundColor: colors.primary }]}
          disabled={!text.trim()}
        >
          <MaterialIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 