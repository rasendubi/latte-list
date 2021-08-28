import React from 'react';
import clsx from 'clsx';

import {
  Button,
  Container,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';

import Shield from '@material-ui/icons/ShieldOutlined';
import ImportExport from '@material-ui/icons/ImportExport';
import GitHub from '@material-ui/icons/GitHub';
import Heart from '@material-ui/icons/Favorite';

import Chrome from '@fortawesome/fontawesome-free/svgs/brands/chrome.svg';
import Firefox from '@fortawesome/fontawesome-free/svgs/brands/firefox.svg';
import Safari from '@fortawesome/fontawesome-free/svgs/brands/safari.svg';

import SignInButton from './SignInButton';

export interface LandingProps {}

const Landing = ({}: LandingProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={clsx(classes.section, classes.iconSection)}>
        <Container maxWidth="sm">
          <img className={classes.icon} src="/favicon.svg" />
          <Typography variant="h1" color="primary">
            Latte List
          </Typography>
          <Typography
            variant="body1"
            color="primary"
            gutterBottom={true}
            paragraph={true}
          >
            A read-it-later list that actually works
          </Typography>
          <SignInButton />
        </Container>
      </div>
      <div className={classes.section}>
        <Container maxWidth="sm">
          <Typography variant="h2" gutterBottom={true} align="center">
            Why Latte List
          </Typography>

          <div className={classes.whyItems}>
            <div className={classes.whyItem}>
              <Typography variant="h3" gutterBottom>
                It works
              </Typography>
              <Typography variant="body1">
                Latte List will help you to actually read the articles you add,
                not just collect them.
              </Typography>
            </div>
            <div className={classes.whyItem}>
              <Typography variant="h3" gutterBottom>
                It scales
              </Typography>
              <Typography variant="body1">
                The more articles you add, the better Latte List works. Feed it
                anything remotely interesting and Latte List will sort it out.
              </Typography>
            </div>
            <div className={classes.whyItem}>
              <Typography variant="h3" gutterBottom>
                Why not?
              </Typography>
              <Typography variant="body1">
                I’ve put a lot of ❤ into it. Why not give it a try?
              </Typography>
            </div>
          </div>
        </Container>
      </div>
      <div className={classes.section}>
        <Container maxWidth="sm">
          <Typography variant="h2" gutterBottom={true} align="center">
            How it works
          </Typography>
          <ol className={classes.list}>
            <li>
              <Typography variant="body1">
                Save every interesting article or video to Latte List.
              </Typography>
              <Typography variant="caption" color="textSecondary">
                (I know you have a couple of them open in your tabs.)
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Latte List will apply a smart algorithm to periodically remind
                you about the items you saved.
              </Typography>
              <Typography variant="caption" color="textSecondary">
                (Well, the algorithm is dumb but it’s learning 🙈.)
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Read it if you’re ready. Or simply postpone it if you’re not—the
                algorithm will remind you about it later.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Latte List will notify you when the next item is available for
                review.
              </Typography>
            </li>
          </ol>
        </Container>
      </div>
      <div className={classes.section}>
        <Container maxWidth="sm">
          <Typography variant="h2" gutterBottom={true} align="center">
            Data
          </Typography>

          <div className={classes.dataItems}>
            <div className={classes.dataItem}>
              <Shield className={classes.dataItemIcon} />
              <Typography variant="body1">
                I take privacy seriously and I will never sell your data. I
                don’t use any tracking either.
              </Typography>
            </div>
            <div className={classes.dataItem}>
              <ImportExport className={classes.dataItemIcon} />
              <Typography variant="body1">
                Your data is yours. You can export or import it anytime.
              </Typography>
            </div>
            <div className={classes.dataItem}>
              <GitHub className={classes.dataItemIcon} />
              <Typography variant="body1">
                Oh, and{' '}
                <a
                  className={classes.link}
                  href="https://github.com/rasendubi/latte-list"
                >
                  Latte List is Open-Source.
                </a>{' '}
                You can host your own version if you’re into that.
              </Typography>
            </div>
          </div>
        </Container>
      </div>
      <div className={classes.section}>
        <Container maxWidth="sm">
          <Typography variant="h2" gutterBottom={true} align="center" paragraph>
            Free in Beta
          </Typography>
          <Typography paragraph>
            Latte List is currently free to use, but I might start charging a
            small fee <strike>when</strike> if my server bill gets too high.
          </Typography>
          <Typography>
            If that happens, I will notify you beforehand and you will still be
            able to export your data.
          </Typography>
        </Container>
      </div>
      <div className={classes.section}>
        <Container maxWidth="sm">
          <Typography variant="h2" paragraph align="center">
            Get it
          </Typography>

          <div className={classes.getItItems}>
            <Paper className={classes.getItItem} variant="outlined">
              <Typography variant="h3" align="center">
                Web
              </Typography>
              <SignInButton variant="short" />
            </Paper>

            {/*
            <Paper className={classes.getItItem} variant="outlined">
              <Typography variant="h3" align="center">
                <img className={classes.browserIcon} src={Chrome} />
                Chrome
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href="https://addons.mozilla.org/en-US/firefox/addon/latte-list/"
              >
                Get Extension
              </Button>
            </Paper>

            <Paper className={classes.getItItem} variant="outlined">
              <Typography variant="h3" align="center">
                <img className={classes.browserIcon} src={Firefox} />
                Firefox
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href="https://addons.mozilla.org/en-US/firefox/addon/latte-list/"
              >
                Get Extension
              </Button>
            </Paper>

            <Paper className={classes.getItItem} variant="outlined">
              <Typography variant="h3" align="center">
                <img className={classes.browserIcon} src={Safari} />
                Safari
              </Typography>
            </Paper>
        */}
          </div>
        </Container>
      </div>
      <footer className={clsx(classes.section, classes.footer)}>
        <Container maxWidth="md">
          <div className={classes.footerContainer}>
            <Typography variant="body2" color="primary">
              Built with ❤ by{' '}
              <a className={classes.link} href="https://www.alexeyshmalko.com">
                Alexey Shmalko
              </a>
            </Typography>
            <Typography variant="body2" color="primary">
              Have any question? Hit me at{' '}
              <a className={classes.link} href="mailto:rasen.dubi@gmail.com">
                rasen.dubi@gmail.com
              </a>
            </Typography>
            <Typography variant="body2" color="primary">
              <a
                className={clsx(classes.link, classes.linkNoUnderline)}
                href="/privacy-policy.html"
              >
                Privacy Policy
              </a>
            </Typography>
          </div>
        </Container>
      </footer>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {},
  section: {
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: theme.palette.background.default,
    '&:nth-child(2n)': {
      backgroundColor: '#fff',
    },
  },
  iconSection: {
    textAlign: 'center',
  },
  icon: {
    width: 128,
  },
  list: {
    '& > li': {
      marginBottom: 16,
    },
    paddingLeft: 32,
    marginRight: 16,
  },
  whyItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 24,
  },
  whyItem: {
    marginTop: 16,
  },
  dataItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 16,
  },
  dataItem: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dataItemIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  getItItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gridAutoRows: '1fr',
    gap: 16,
  },
  getItItem: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  link: {
    color: 'inherit',
    borderRadius: 2,
    transition: 'background-color 0.1s ease-in-out',
    backgroundColor: 'rgba(0,0,0,0.0)',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    '&:active': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  },
  linkNoUnderline: {
    textDecoration: 'none',
  },
  footer: {
    padding: '8px 0',
  },
  footerContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 32,
    rowGap: 8,
  },
  browserIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
}));

export default Landing;
