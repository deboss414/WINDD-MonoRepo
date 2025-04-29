import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../hooks/useAuth';
import { getColors } from '../../constants/colors';
import { ApiError } from '../../services/base/ApiError';
import { pingBackend } from '../../utils/apiClient';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      console.log('Checking backend connection...');
      
      const isBackendAvailable = await pingBackend();
      if (!isBackendAvailable) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
        return;
      }

      console.log('Attempting login with:', { email });
      const response = await login(email, password);
      console.log('Login successful:', response);
      // Navigation will happen automatically due to AuthNavigator
    } catch (error: any) {
      console.error('Login error details:', {
        error,
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
        response: error?.response?.data
      });
      
      let errorMessage = 'Login failed';
      if (error?.code === 'AUTH_FAILED' || error?.code === 'INVALID_CREDENTIALS') {
        errorMessage = 'Invalid email or password';
      } else if (error?.code === 'MISSING_CREDENTIALS') {
        errorMessage = 'Please enter both email and password';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Login</Text>
      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Welcome to WinDD!</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.divider,
            color: colors.text,
          }]}
          placeholder="Email"
          placeholderTextColor={colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.divider,
            color: colors.text,
          }]}
          placeholder="Password"
          placeholderTextColor={colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={() => navigation.navigate('Signup')}
        disabled={loading}
      >
        <Text style={[styles.linkText, { color: colors.primary }]}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
  },
}); 