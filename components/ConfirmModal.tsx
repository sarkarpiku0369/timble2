import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ConfirmModal = ({ visible, onCancel, onConfirm }: any) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Remove Like</Text>
          <Text style={styles.message}>
            Are you sure you want to remove this user from your likes?
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelBtn]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.removeBtn]}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  message: { fontSize: 14, color: '#555', marginBottom: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#eee', marginRight: 10 },
  removeBtn: { backgroundColor: '#ff4d4f' },
  cancelText: { color: '#333' },
  removeText: { color: '#fff' },
});

export default ConfirmModal;
