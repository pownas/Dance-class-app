import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';

interface NotesEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  syncStatus: 'saved' | 'pending' | 'error';
}

export default function NotesEditor({ value, onChangeText, syncStatus }: NotesEditorProps) {
  const statusLabel = {
    saved: '✓ Sparad',
    pending: '● Ej sparad',
    error: '✕ Synkfel',
  }[syncStatus];

  const statusColor = {
    saved: '#4caf50',
    pending: '#ff9800',
    error: '#f44336',
  }[syncStatus];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anteckningar (Markdown)</Text>
        <Text style={[styles.syncStatus, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      <TextInput
        style={styles.textInput}
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder="Skriv dina instruktioner i Markdown här..."
        placeholderTextColor="#aaa"
        textAlignVertical="top"
        autoCapitalize="sentences"
        accessibilityLabel="Notes editor"
        accessibilityHint="Write your dance class notes in Markdown format"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 24,
    color: '#222',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
