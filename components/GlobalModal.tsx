import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";

const GlobalModal = ({
  title,
  value,
  setValue,
  visible,
  onClose,
  onSave,
  maxLength = 500,
  placeholder = "Write here...",
}: any) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={value}
            onChangeText={setValue}
            multiline
            numberOfLines={6}
            maxLength={maxLength}
            textAlignVertical="top"
            style={styles.textArea}
            placeholder={placeholder}
            placeholderTextColor="#999"
            scrollEnabled
            blurOnSubmit={false}
          />

          <Text style={styles.characterCount}>
            {value?.length || 0}/{maxLength}
          </Text>

          <TouchableOpacity style={styles.doneButton} onPress={onSave}>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeIcon: {
    fontSize: 18,
    color: "#E91E63",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 15,
  },
  doneButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default GlobalModal;
