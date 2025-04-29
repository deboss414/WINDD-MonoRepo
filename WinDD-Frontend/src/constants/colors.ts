export interface Colors {
  background: string;
  cardBackground: string;
  text: string;
  secondaryText: string;
  primary: string;
  white: string;
  divider: string;
  success: string;
  error: string;
  taskStatus: {
    'in-progress': string;
    completed: string;
    expired: string;
    closed: string;
  };
  disabled: string;
}

export function getColors(colorScheme: 'light' | 'dark'): Colors {
  if (colorScheme === 'dark') {
    return {
      background: '#121212',
      cardBackground: '#1E1E1E',
      text: '#FFFFFF',
      secondaryText: '#B0B0B0',
      primary: '#2196F3',
      white: '#FFFFFF',
      divider: '#2C2C2C',
      success: '#4CAF50',
      error: '#F44336',
      taskStatus: {
        'in-progress': '#FFA726',
        completed: '#4CAF50',
        expired: '#F44336',
        closed: '#9E9E9E',
      },
      disabled: '#666666',
    };
  }

  return {
    background: '#FFFFFF',
    cardBackground: '#F5F5F5',
    text: '#000000',
    secondaryText: '#666666',
    primary: '#2196F3',
    white: '#FFFFFF',
    divider: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    taskStatus: {
      'in-progress': '#FFA726',
      completed: '#4CAF50',
      expired: '#F44336',
      closed: '#9E9E9E',
    },
    disabled: '#cccccc',
  };
}
