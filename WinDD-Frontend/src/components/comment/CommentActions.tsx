import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';
import { commentStyles } from './styles';

interface CommentActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  isEditing?: boolean;
}

export const CommentActions: React.FC<CommentActionsProps> = ({
  onEdit,
  onDelete,
  onReply,
  isEditing = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <View style={commentStyles.actions}>
      <TouchableOpacity
        style={commentStyles.actionButton}
        onPress={onEdit}
      >
        <MaterialIcons
          name={isEditing ? 'check' : 'edit'}
          size={16}
          color={colors.primary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={commentStyles.actionButton}
        onPress={onReply}
      >
        <MaterialIcons
          name="reply"
          size={16}
          color={colors.primary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={commentStyles.actionButton}
        onPress={onDelete}
      >
        <MaterialIcons
          name="delete"
          size={16}
          color={colors.taskStatus.expired}
        />
      </TouchableOpacity>
    </View>
  );
}; 