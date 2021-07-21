import React from 'react';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';
import Card, { CardProps } from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CardActions, IconButton } from '@material-ui/core';

import ArchiveIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import UnpinIcon from '@material-ui/icons/Bookmark';
import PinIcon from '@material-ui/icons/BookmarkBorder';

import { Item } from '@/lib/Item';

export interface ItemCardProps extends CardProps {
  item: Item;
  layout?: 'default' | 'horizontal';
  withActions?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    horizontal: {
      flex: 'auto',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
    },
    horizontalRight: {
      flex: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'stretch',
    },
    cardRightActionArea: {
      flex: 'auto',
      marginBottom: -8,
    },
    headerHorizontal: {
      paddingBottom: 0,
    },
    cardContentHorizontal: {
      flex: 'auto',
      paddingTop: 0,
      paddingBottom: 8,
    },
    cardActionsHorizontal: {
      paddingLeft: 12,
    },
    descriptionHorizontal: {
      display: '-webkit-box',
      // flex-grow: 1;
      flexShrink: 1,
      textOverflow: 'ellipsis',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
    },
    sub: {
      display: 'flex',
    },
    icon: {
      height: '1em',
      marginRight: '0.7ch',
      alignSelf: 'center',
    },
    readTime: {
      '&::before': {
        margin: '0 0.5ch',
        content: '"·"',
      },
      whiteSpace: 'nowrap',
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    mediaActionAreaHorizontal: {
      width: 'calc(min(240px, 40vw))',
      alignSelf: 'stretch',
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'stretch',
      alignItems: 'stretch',
    },
    mediaHorizontal: {
      flex: 'auto',
    },
    cardContent: {
      flex: 'auto',
      '&:last-child': {
        paddingBottom: 16,
      },
    },
  })
);

const ItemCard = ({
  item,
  layout,
  withActions,
  className,
  onArchive,
  onDelete,
  onPin,
  ...props
}: ItemCardProps) => {
  const classes = useStyles();
  const hostname = new URL(item.url).hostname.replace(/^www\./, '');
  return (
    <Card
      square={true}
      variant="outlined"
      {...props}
      className={clsx(classes.root, className)}
    >
      {layout === 'horizontal' ? (
        <div className={classes.horizontal}>
          <div className={classes.horizontalRight}>
            <CardActionArea
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener"
              className={classes.cardRightActionArea}
            >
              <CardHeader
                className={classes.headerHorizontal}
                title={item.title}
                subheader={
                  <Typography
                    variant="caption"
                    className={classes.sub}
                    color="textSecondary"
                    gutterBottom={true}
                  >
                    {item.icon && (
                      <img className={classes.icon} src={item.icon} />
                    )}
                    {hostname}
                    {item.minutes && (
                      <div className={classes.readTime}>
                        {Math.ceil(item.minutes)}
                        {' min'}
                      </div>
                    )}
                  </Typography>
                }
              />
              <CardContent
                className={clsx(
                  classes.cardContent,
                  classes.cardContentHorizontal
                )}
              >
                <Typography
                  variant="body2"
                  className={classes.descriptionHorizontal}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            {withActions && (
              <CardActions className={classes.cardActionsHorizontal}>
                <IconButton size="small" onClick={onArchive}>
                  <ArchiveIcon />
                </IconButton>
                <IconButton size="small" onClick={onDelete}>
                  <DeleteIcon />
                </IconButton>
                <IconButton size="small" onClick={onPin}>
                  {item.pinnedOn ? <UnpinIcon /> : <PinIcon />}
                </IconButton>
              </CardActions>
            )}
          </div>
          {item.image && (
            <CardActionArea
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener"
              className={classes.mediaActionAreaHorizontal}
            >
              <CardMedia
                image={item.image}
                className={classes.mediaHorizontal}
              />
            </CardActionArea>
          )}
        </div>
      ) : (
        <CardActionArea
          component="a"
          href={item.url}
          target="_blank"
          rel="noopener"
        >
          <CardHeader
            title={item.title}
            subheader={
              <Typography
                variant="caption"
                className={classes.sub}
                color="textSecondary"
              >
                {item.icon && <img className={classes.icon} src={item.icon} />}
                {hostname}
                {item.minutes && (
                  <div className={classes.readTime}>
                    {Math.ceil(item.minutes)}
                    {' min'}
                  </div>
                )}
              </Typography>
            }
          />
          {item.image && (
            <CardMedia image={item.image} className={classes.media} />
          )}
          <CardContent className={classes.cardContent}>
            <Typography variant="body2" gutterBottom={true}>
              {item.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      )}
    </Card>
  );
};

export default ItemCard;
