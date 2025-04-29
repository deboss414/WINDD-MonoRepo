import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { pingBackend } from '../utils/apiClient';
import { getColors } from '../constants/colors';
import { useColorScheme } from 'react-native';

export const TestConnectionScreen = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [logs, setLogs] = useState<string[]>([]);
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const testConnection = async () => {
    setLogs([]);
    setConnectionStatus('Testing...');
    
    // Override console.log to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      setLogs(prev => [...prev, `[INFO] ${args.join(' ')}`]);
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
      originalConsoleError(...args);
    };

    try {
      const isConnected = await pingBackend();
      setConnectionStatus(isConnected ? 'Connected ✅' : 'Failed ❌');
    } catch (error) {
      setConnectionStatus('Error ❌');
      console.error('Test failed:', error);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: colors.text }]}>
          Status: {connectionStatus}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testConnection}
      >
        <Text style={styles.buttonText}>Test Connection</Text>
      </TouchableOpacity>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text 
            key={index} 
            style={[
              styles.logText, 
              { color: log.includes('[ERROR]') ? colors.error : colors.text }
            ]}
          >
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  status: {
    fontSize: 18,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
}); 