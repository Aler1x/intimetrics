import type { Theme } from '@react-navigation/native';

export type ThemeColors = Theme['colors'] & {
  foreground: string;
  placeholder: string;
  destructive: string;
  input: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  secondaryForeground: string;
};

export const DefaultTheme: Theme & { colors: ThemeColors } = {
  dark: true,
  colors: {
    background: 'hsl(240 10% 3.9%)', // #181825
    foreground: 'hsl(220 16% 91%)', // #cdd6f4
    placeholder: 'hsl(237, 16%, 23%)', // #313244
    border: 'hsl(240 9% 15%)', // #313244
    card: 'hsl(240 10% 12%)', // #1e1e2e
    notification: 'hsl(343 81% 75%)', // #f38ba8
    primary: 'hsl(25 52% 67%)', // #c39e88
    secondary: 'hsl(233, 12%, 39%)', // #313244
    secondaryForeground: 'hsl(226, 64%, 88%)', // #a6adc8
    text: 'hsl(220 16% 91%)', // #cdd6f4
    destructive: 'hsl(343, 81%, 75%)', // #f38ba8
    input: 'hsl(237, 16%, 23%)', // #313244
    muted: 'hsl(237, 16%, 23%)', // #313244
    mutedForeground: 'hsl(227.6471 23.6111% 71.7647%)', // #a6adc8
  },
  fonts: {
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'Inter-Bold',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'Inter-Heavy',
      fontWeight: '800',
    },
  },
} as const;
