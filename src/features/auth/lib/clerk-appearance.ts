import { dark } from '@clerk/themes'

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: 'oklch(0.205 0 0)',
    colorForeground: 'oklch(0.985 0 0)',
    colorInput: 'oklch(1 0 0 / 15%)',
    colorInputForeground: 'oklch(0.985 0 0)',
    colorPrimary: 'oklch(0.922 0 0)',
    colorPrimaryForeground: 'oklch(0.205 0 0)',
    colorMutedForeground: 'oklch(0.708 0 0)',
    colorModalBackdrop: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.45rem',
    fontFamily: 'var(--font-sans)',
    fontFamilyButtons: 'var(--font-sans)',
  },
  elements: {
    modalBackdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    modalContent: {
      margin: 'auto',
      border: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      outline: 'none',
    },
    cardBox: {
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      border: '1px solid oklch(1 0 0 / 10%)',
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
    },
    card: {
      backgroundColor: 'oklch(0.205 0 0)',
      borderRadius: 'var(--radius)',
      boxShadow: 'none',
    },
    footerAction__signUp: { display: 'none' },
    socialButtonsBlockButton: {
      border: '1px solid oklch(1 0 0 / 10%)',
      backgroundColor: 'oklch(0.145 0 0)',
      color: 'oklch(0.985 0 0)',
    },
    socialButtonsBlockButtonText: {
      color: 'oklch(0.985 0 0)',
      fontWeight: 500,
    },
  },
}
