import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  typography: {
    fontFamily: ['"Source Sans Pro"', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    h1: {
      fontSize: 48,
      lineHeight: 1,
      fontWeight: 700,
    },
    h2: {
      fontSize: 18,
      fontWeight: 700,
    },
    h3: {
      fontSize: 22,
    },
    h4: {
      fontSize: 20,
      fontWeight: 700,
    },
    h5: {
      fontSize: 18,
      fontWeight: 700,
    },
    h6: {
      fontSize: 16,
      fontWeight: 700,
    },
    button: {
      textTransform: 'unset',
    },
  },
  palette: {
    primary: {
      main: '#3A3335',
    },
    secondary: {
      main: '#357266',
    },
    background: {
      default: '#F1EDDF',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        // 'html, body, #root': {
        //   height: '100%',
        // },
      },
    },
  },
});

export default theme;
