import { createTheme, type Shadows } from '@mui/material/styles';

/**
 * Tema de MUI para el diseño "Camino". Los colores visibles salen de los tokens
 * CSS de `globals.css` (así cambian con la paleta); la `palette` de abajo sólo
 * le da a MUI valores reales para sus cálculos internos (ripples, contrastes).
 */

const DISPLAY = "var(--font-display), 'Trebuchet MS', system-ui, sans-serif";
const BODY = "var(--font-body), 'Segoe UI', system-ui, sans-serif";
const RESORTE = 'var(--spring)';

const titular = (fontSize: string) => ({
  fontFamily: DISPLAY, fontWeight: 800, fontSize, lineHeight: 1.1, letterSpacing: '-0.02em',
});

const sombras = ['none', ...Array<string>(24).fill('var(--shadow)')] as Shadows;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1B2559', contrastText: '#FFFFFF' },
    secondary: { main: '#FF5C8A', contrastText: '#FFFFFF' },
    error: { main: '#D92D4B' },
    warning: { main: '#C97A00' },
    success: { main: '#1E9E6A' },
    background: { default: '#E9F1FF', paper: '#FFFFFF' },
    text: { primary: '#1B2559', secondary: '#6B76A8' },
    divider: '#C7D6F5',
  },
  typography: {
    fontFamily: BODY,
    fontWeightRegular: 500,
    h1: titular('clamp(2.2rem, 6vw, 3.6rem)'),
    h2: titular('1.9rem'),
    h3: titular('1.5rem'),
    h4: titular('1.25rem'),
    h5: { fontSize: '1rem', fontWeight: 800, lineHeight: 1.4 },
    h6: { fontSize: '0.875rem', fontWeight: 800, lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    button: { fontWeight: 800 },
  },
  shape: { borderRadius: 16 },
  shadows: sombras,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: 'var(--bg)', color: 'var(--ink)' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 999,
          transition: `transform 0.25s ${RESORTE}, background-color 0.2s, color 0.2s, border-color 0.2s`,
          '&:hover': { transform: 'translateY(-3px)' },
          '&:active': { transform: 'scale(0.97)' },
          '&.Mui-disabled': { backgroundColor: 'var(--line)', color: 'var(--soft)', borderColor: 'var(--line)' },
        },
        sizeMedium: { padding: '9px 22px' },
        sizeLarge: { padding: '13px 28px', fontSize: '0.9375rem' },
        outlined: {
          borderWidth: 2,
          borderColor: 'var(--line)',
          color: 'var(--ink)',
          backgroundColor: 'var(--card)',
          '&:hover': { borderWidth: 2, borderColor: 'var(--ink)', backgroundColor: 'var(--card)' },
        },
        text: { color: 'var(--ink)', '&:hover': { backgroundColor: 'var(--bg)' } },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: 'var(--solid)',
            color: 'var(--on-solid)',
            '&:hover': { backgroundColor: 'var(--pink)', color: 'var(--on-accent)' },
          },
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: { backgroundColor: 'var(--bad)', color: 'var(--on-accent)', '&:hover': { backgroundColor: 'var(--bad)' } },
        },
        {
          props: { variant: 'outlined', color: 'error' },
          style: { color: 'var(--bad)', '&:hover': { borderColor: 'var(--bad)' } },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'var(--soft)',
          transition: `transform 0.25s ${RESORTE}, background-color 0.2s, color 0.2s`,
          '&:hover': { backgroundColor: 'var(--bg)', color: 'var(--ink)', transform: 'scale(1.12)' },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'var(--card)',
          color: 'var(--ink)',
          '& fieldset': { borderColor: 'var(--line)', borderWidth: 2 },
          '&:hover fieldset': { borderColor: 'var(--soft) !important' },
          '&.Mui-focused fieldset': { borderColor: 'var(--pink) !important', borderWidth: 2 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'var(--soft)', '&.Mui-focused': { color: 'var(--pink)' } },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: 'var(--soft)' } } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: 'var(--card)', color: 'var(--ink)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 28, border: 'none', boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999, fontWeight: 800, fontSize: '0.75rem', color: 'var(--ink)',
          transition: `transform 0.2s ${RESORTE}, background-color 0.2s, color 0.2s`,
          '&.MuiChip-clickable:hover': { transform: 'translateY(-2px)' },
        },
      },
      // El relleno va por variante: una píldora elegida tiene que distinguirse de las demás.
      variants: [
        { props: { variant: 'filled', color: 'default' }, style: { backgroundColor: 'var(--bg)' } },
        {
          props: { variant: 'filled', color: 'primary' },
          style: {
            backgroundColor: 'var(--solid)', color: 'var(--on-solid)',
            '&.MuiChip-clickable:hover': { backgroundColor: 'var(--solid)' },
          },
        },
        {
          props: { variant: 'outlined' },
          style: { backgroundColor: 'var(--card)', borderColor: 'var(--line)', borderWidth: 2 },
        },
      ],
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: { '&.Mui-checked': { color: 'var(--pink)' }, '&.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--pink)' } },
        track: { backgroundColor: 'var(--soft)' },
      },
    },
    MuiCheckbox: { styleOverrides: { root: { color: 'var(--soft)', '&.Mui-checked': { color: 'var(--pink)' } } } },
    MuiAccordion: {
      styleOverrides: {
        root: { borderRadius: '20px !important', boxShadow: 'none', '&::before': { display: 'none' } },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { borderRadius: 20, boxShadow: 'var(--shadow)' },
        option: { borderRadius: 12, margin: '2px 8px' },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { backgroundColor: 'var(--mint)', color: 'var(--on-tint)', fontFamily: DISPLAY, fontWeight: 800 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: 'var(--line)' } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: 'transparent',
            color: 'var(--soft)',
            fontWeight: 800,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '3px dotted var(--line)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'var(--line)', color: 'var(--ink)', padding: '14px 16px', fontSize: '0.875rem' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s',
          '&:hover': { backgroundColor: 'var(--bg)' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 28, boxShadow: 'var(--shadow)' } },
    },
    MuiDialogTitle: { styleOverrides: { root: { ...titular('1.5rem') } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: 20, boxShadow: 'var(--shadow)' } } },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12, margin: '2px 8px', padding: '8px 12px',
          '&:hover, &.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'var(--bg)' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 0, '& .MuiTabs-list, & .MuiTabs-flexContainer': { gap: 8, flexWrap: 'wrap' } },
        indicator: { display: 'none' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          minHeight: 0,
          padding: '9px 18px',
          borderRadius: 999,
          color: 'var(--soft)',
          backgroundColor: 'var(--card)',
          transition: `transform 0.2s ${RESORTE}, background-color 0.2s, color 0.2s`,
          '&:hover': { color: 'var(--ink)', transform: 'translateY(-3px)' },
          '&.Mui-selected': { backgroundColor: 'var(--solid)', color: 'var(--on-solid)' },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--solid)', color: 'var(--on-solid)', borderRadius: 999,
          fontWeight: 800, padding: '6px 12px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, height: 8, backgroundColor: 'var(--line)' },
        bar: { borderRadius: 999, backgroundColor: 'var(--pink)' },
      },
    },
    MuiCircularProgress: { styleOverrides: { root: { color: 'var(--pink)' } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 20, fontWeight: 600 } } },
  },
});

export default theme;
