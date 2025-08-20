import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput
} from 'react-native';

const AboutAddModal = ({
  about,
  setAbout,
  visible,
  onClose,
  onSave
}: any) => {
  return (
    <Modal
      visible={visible}
      animationType="slide" // bottom slide
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit About Me</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={about}
            onChangeText={setAbout}
            multiline={true}
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
            style={styles.textArea}
            placeholder="Write something about yourself..."
            placeholderTextColor="#999"
            scrollEnabled={true}
            blurOnSubmit={false}
          />
          
          <Text style={styles.characterCount}>
            {about?.length || 0}/500
          </Text>

          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={onSave}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  closeIcon: {
    fontSize: 18,
    color: '#E91E63'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    marginBottom: 8
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 15
  },
  doneButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default AboutAddModal;