import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../lib/design';
import { API_BASE } from '../lib/constants';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactModal({ visible, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setStatus('error');
      setErrorMessage('All fields are required');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after closing
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setStatus('idle');
      setErrorMessage('');
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Pressable
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          {/* Modal Content */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '80%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                }}
              >
                Contact Us
              </Text>
              <Pressable
                onPress={handleClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.backgroundAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X color={colors.textPrimary} size={18} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: spacing.md }}>
              {status === 'success' ? (
                <View
                  style={{
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingVertical: spacing.xl,
                  }}
                >
                  <CheckCircle size={48} color="#16a34a" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: colors.textPrimary,
                    }}
                  >
                    Message Sent!
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                    }}
                  >
                    We'll get back to you soon.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: spacing.md }}>
                  {/* Name */}
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: spacing.xs,
                      }}
                    >
                      Name
                    </Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor={colors.textMuted}
                      style={{
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        padding: spacing.sm,
                        fontSize: 16,
                        color: colors.textPrimary,
                      }}
                    />
                  </View>

                  {/* Email */}
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: spacing.xs,
                      }}
                    >
                      Email
                    </Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your@email.com"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        padding: spacing.sm,
                        fontSize: 16,
                        color: colors.textPrimary,
                      }}
                    />
                  </View>

                  {/* Message */}
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: spacing.xs,
                      }}
                    >
                      Message
                    </Text>
                    <TextInput
                      value={message}
                      onChangeText={setMessage}
                      placeholder="How can we help?"
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      style={{
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        padding: spacing.sm,
                        fontSize: 16,
                        color: colors.textPrimary,
                        minHeight: 100,
                      }}
                    />
                  </View>

                  {/* Error */}
                  {status === 'error' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                      }}
                    >
                      <AlertCircle size={16} color="#dc2626" />
                      <Text style={{ color: '#dc2626', fontSize: 14 }}>
                        {errorMessage}
                      </Text>
                    </View>
                  )}

                  {/* Submit */}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={status === 'loading'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.xs,
                      backgroundColor: colors.primary,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      opacity: status === 'loading' ? 0.5 : 1,
                      marginBottom: spacing.lg,
                    }}
                  >
                    {status === 'loading' ? (
                      <ActivityIndicator color={colors.textOnDark} />
                    ) : (
                      <>
                        <Send color={colors.textOnDark} size={18} />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: colors.textOnDark,
                          }}
                        >
                          Send Message
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
