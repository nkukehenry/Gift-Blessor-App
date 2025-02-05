/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const palette = {
  primary: '#FF424D',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  red: {
    100: '#FFEBEE',
    500: '#F44336',
    700: '#D32F2F',
  },
};

export interface Theme {
  primary: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  border: {
    light: string;
    dark: string;
  };
  error: string;
  gray: {
    light: string;
    dark: string;
  };
}

export const Colors = {
  light: {
    primary: '#FF424D',
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F8F8',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    border: {
      light: '#EEEEEE',
      dark: '#DDDDDD',
    },
    error: '#FF424D',
    gray: {
      light: '#EEEEEE',
      dark: '#DDDDDD',
    },
  } as Theme,
  dark: {
    primary: '#FF424D',
    background: {
      primary: '#000000',
      secondary: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#999999',
    },
    border: {
      light: '#333333',
      dark: '#444444',
    },
    error: '#FF424D',
    gray: {
      light: '#EEEEEE',
      dark: '#DDDDDD',
    },
  } as Theme,
};

export type Colors = typeof Colors
