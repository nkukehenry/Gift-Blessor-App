import React, { createContext, useContext, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

interface ModalOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'loading';
  primaryButton?: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const showModal = (modalOptions: ModalOptions) => {
    setOptions(modalOptions);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setOptions(null);
  };

  const getIconByType = (type?: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      case 'info':
        return 'i';
      default:
        return '';
    }
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background.primary }]}>
            {options?.type === 'loading' ? (
              <>
                <ActivityIndicator size="large" color={theme.button.primary} />
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  {options.title}
                </Text>
                <Text style={[styles.message, { color: theme.text.secondary }]}>
                  {options.message}
                </Text>
              </>
            ) : (
              <>
                {options?.type && (
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: options.type === 'error' ? theme.error : theme.success }
                  ]}>
                    <Text style={styles.icon}>{getIconByType(options.type)}</Text>
                  </View>
                )}
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  {options?.title}
                </Text>
                <Text style={[styles.message, { color: theme.text.secondary }]}>
                  {options?.message}
                </Text>
                <View style={styles.buttonContainer}>
                  {options?.secondaryButton && (
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton, { borderColor: theme.border.primary }]}
                      onPress={() => {
                        options.secondaryButton?.onPress();
                        hideModal();
                      }}
                    >
                      <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                        {options.secondaryButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {options?.primaryButton && (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: theme.button.primary }]}
                      onPress={() => {
                        options.primaryButton?.onPress();
                        hideModal();
                      }}
                    >
                      <Text style={[styles.buttonText, styles.primaryButtonText]}>
                        {options.primaryButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.85,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
});

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}