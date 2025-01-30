import { StyleSheet, Platform } from "react-native"
import { Colors, Theme } from "./Colors"

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const

export const layout = {
  screenPadding: spacing.lg,
  headerHeight: spacing.xxl,
  inputHeight: 48,
  buttonHeight: 48,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
} as const

export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Screen Containers
    screen: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: layout.screenPadding,
      paddingTop: layout.headerHeight,
      paddingBottom: spacing.lg,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Headers
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: typography.size.xl,
      lineHeight: typography.lineHeight.xl,
      fontWeight: typography.weight.bold,
      color: theme.text.primary,
      marginLeft: spacing.sm,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
    },

    // Forms
    form: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.size.sm,
      lineHeight: typography.lineHeight.sm,
      fontWeight: typography.weight.medium,
      color: theme.text.secondary,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: layout.inputHeight,
      borderWidth: 1,
      borderRadius: layout.borderRadius.xl,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.background.primary,
      borderColor: theme.border.light,
    },
    input: {
      flex: 1,
      fontSize: typography.size.md,
      lineHeight: typography.lineHeight.md,
      color: theme.text.primary,
    },
    inputIcon: {
      marginRight: spacing.md,
      color: theme.text.secondary,
    },

    // Buttons
    button: {
      height: layout.buttonHeight,
      borderRadius: layout.borderRadius.xl,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primary,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: typography.size.md,
      lineHeight: typography.lineHeight.md,
      fontWeight: typography.weight.semibold,
      color: theme.background.primary,
    },
    buttonIcon: {
      marginRight: spacing.sm,
    },

    // Text Styles
    title: {
      fontSize: typography.size.xxxl,
      lineHeight: typography.lineHeight.xxxl,
      fontWeight: typography.weight.bold,
      color: theme.primary,
      marginBottom: -spacing.xs,
    },
    subtitle: {
      fontSize: typography.size.xxxl,
      lineHeight: typography.lineHeight.xxxl,
      fontWeight: typography.weight.bold,
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.size.md,
      lineHeight: typography.lineHeight.md,
      color: theme.text.secondary,
    },

    // Links
    link: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    linkText: {
      fontSize: typography.size.sm,
      lineHeight: typography.lineHeight.sm,
      color: theme.text.secondary,
    },
    linkTextBold: {
      fontWeight: typography.weight.semibold,
      color: theme.primary,
    },

    // Lists
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      backgroundColor: theme.background.secondary,
      borderRadius: layout.borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.size.lg,
      lineHeight: typography.lineHeight.lg,
      fontWeight: typography.weight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    cardDescription: {
      fontSize: typography.size.sm,
      lineHeight: typography.lineHeight.sm,
      color: theme.text.secondary,
    },
    errorText: {
      fontSize: 16,
      color: theme.error,
      textAlign: 'center',
    },
  }) 