import { grey, orange, purple } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  typography: {
    fontFamily: ['"Noto Sans"', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    h2: {
      fontSize: 18,
      fontWeight: 700,
    },
    h5: {
      fontSize: 18,
      fontWeight: 700,
    },
  },
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: purple[800],
    },
    background: {
      // default: '#fff',
    },
  },
  // overrides: {
  //   MuiCssBaseline: {
  //     '@global': {},
  //   },
  // },
});

export default theme;
