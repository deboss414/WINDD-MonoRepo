import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  useColorScheme,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Project Manager',
    bio: 'Experienced project manager with a focus on team collaboration and efficient task management.',
    avatar: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile({ ...profile, avatar: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <View style={[styles.avatarWrapper, { backgroundColor: colors.cardBackground }]}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <MaterialIcons name="person" size={64} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.divider }]}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{profile.name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.divider }]}
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              keyboardType="email-address"
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{profile.email}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Role</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.divider }]}
              value={profile.role}
              onChangeText={(text) => setProfile({ ...profile, role: text })}
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{profile.role}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.bioInput, { color: colors.text, borderColor: colors.divider }]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{profile.bio}</Text>
          )}
        </View>
      </View>

      {isEditing && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 