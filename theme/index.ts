import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { colors } from './colors';

export { colors };

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[600],
    onPrimary: colors.white,
    primaryContainer: colors.primary[100],
    onPrimaryContainer: colors.primary[900],
    secondary: colors.accent[400],
    onSecondary: colors.primary[900],
    background: colors.gray[50],
    surface: colors.white,
    error: colors.danger,
  },
};
