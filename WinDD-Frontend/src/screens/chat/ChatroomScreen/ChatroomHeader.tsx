import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ChatroomHeaderProps } from './types';

export const ChatroomHeader: React.FC<ChatroomHeaderProps> = ({
  taskTitle,
  taskId,
  participants,
  onBackPress,
  onMenuPress,
  onParticipantsPress,
  showParticipantsModal,
  setShowParticipantsModal,
  colors,
}) => {
  console.log('Header participants:', participants); // Debug log

  return (
    <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={onBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {taskTitle}
          </Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={onMenuPress}
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {participants.length > 0 && (
          <TouchableOpacity 
            style={styles.avatarsContainer}
            onPress={onParticipantsPress}
          >
            {participants.slice(0, 5).map((participant, index) => (
              <View
                key={participant.id}
                style={[
                  styles.avatarWrapper,
                  { marginLeft: index > 0 ? -12 : 0 }
                ]}
              >
                {participant.avatar ? (
                  <Image
                    source={{ uri: participant.avatar }}
                    style={styles.headerAvatar}
                  />
                ) : (
                  <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.headerAvatarText}>
                      {participant.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {participants.length > 5 && (
              <View style={[styles.avatarWrapper, { marginLeft: -12 }]}>
                <View style={[styles.headerAvatar, { backgroundColor: colors.secondaryText }]}>
                  <Text style={styles.headerAvatarText}>
                    +{participants.length - 5}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Participants Modal */}
      <Modal
        visible={showParticipantsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowParticipantsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowParticipantsModal(false)}
        >
          <View style={[styles.participantsModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Participants</Text>
              <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.participantsList}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  {participant.avatar ? (
                    <Image
                      source={{ uri: participant.avatar }}
                      style={styles.participantAvatar}
                    />
                  ) : (
                    <View style={[styles.participantAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.participantAvatarText}>
                        {participant.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.participantName, { color: colors.text }]}>
                    {participant.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    marginHorizontal: -6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsModal: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  participantsList: {
    maxHeight: '80%',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 