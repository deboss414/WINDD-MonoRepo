import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface SettingsSection {
  title: string;
  items: {
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    screen: keyof SettingsStackParamList;
  }[];
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        icon: 'person',
        screen: 'Profile',
      },
      {
        title: 'Account Settings',
        icon: 'security',
        screen: 'AccountSettings',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        title: 'App Preferences',
        icon: 'settings',
        screen: 'AppPreferences',
      },
      {
        title: 'Notifications',
        icon: 'notifications',
        screen: 'AppPreferences',
      },
    ],
  },
  {
    title: 'Team',
    items: [
      {
        title: 'Team Settings',
        icon: 'group',
        screen: 'TeamSettings',
      },
      {
        title: 'Members',
        icon: 'people',
        screen: 'TeamSettings',
      },
    ],
  },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const renderSection = (section: SettingsSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        {section.title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.cardBackground }]}>
        {section.items.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.settingItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.settingItemLeft}>
              <MaterialIcons
                name={item.icon}
                size={24}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {item.title}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {settingsSections.map(renderSection)}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 