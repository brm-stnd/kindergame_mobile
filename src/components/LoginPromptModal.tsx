import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { UserCog } from 'lucide-react-native';

const PRIMARY = '#2DBCAF';

interface Props {
  visible: boolean;
  onLogin?: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  required?: boolean;
}

export default function LoginPromptModal({
  visible,
  onLogin,
  onClose,
  title = 'Ups! Kamu Belum Login',
  subtitle = 'Silakan login terlebih dahulu untuk menyimpan game favoritmu.',
  required = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={required ? undefined : onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={required ? undefined : onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.iconCircle}>
            <UserCog size={38} color={PRIMARY} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          
          <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
            <Image
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              style={styles.googleIcon}
            />
            <Text style={styles.loginBtnText}>Masuk dengan Google</Text>
          </TouchableOpacity>
          
          {!required && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Nanti Saja</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 80,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    paddingTop: 36,
    width: '92%',
    maxWidth: 480,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(45,188,175,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  loginBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
});
