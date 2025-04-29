import React from 'react';
import { View, Text } from 'react-native';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';
import { commentStyles } from './styles';
import { formatDate } from '../../utils/dateUtils';

interface CommentContentProps {
  authorName: string;
  createdAt: string;
  text: string;
  isEdited?: boolean;
}

export const CommentContent: React.FC<CommentContentProps> = ({
  authorName,
  createdAt,
  text,
  isEdited = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <View style={[commentStyles.container, { backgroundColor: colorScheme === 'dark' ? colors.background : colors.cardBackground }]}>
      <View style={commentStyles.header}>
        <Text style={[commentStyles.author, { color: colors.text, opacity: 1 }]}>
          {authorName}
        </Text>
        <Text style={[commentStyles.date, { color: colors.secondaryText, opacity: 0.8 }]}>
          {formatDate(createdAt)}
          {isEdited && ' (edited)'}
        </Text>
      </View>
      <Text style={[commentStyles.text, { color: colors.text, opacity: 1 }]}>
        {text}
      </Text>
    </View>
  );
}; 