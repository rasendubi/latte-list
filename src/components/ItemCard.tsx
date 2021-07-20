import React from 'react';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';
import Card, { CardProps } from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { Item } from '@/lib/Item';

export interface ItemCardProps extends CardProps {
  item: Item;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {},
    sub: {
      display: 'flex',
    },
    icon: {
      height: `calc(1em * ${theme.typography.caption.lineHeight})`,
      marginRight: '0.5ch',
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
    cardContent: {
      '&:last-child': {
        paddingBottom: 16,
      },
    },
  })
);

const ItemCard = ({ item, className, ...props }: ItemCardProps) => {
  const classes = useStyles();
  return (
    <Card
      {...props}
      className={clsx(classes.root, className)}
      square={true}
      variant="outlined"
    >
      <CardActionArea onClick={() => window.open(item.url, '_blank')}>
        <CardHeader title={item.title} />
        {item.image && (
          <CardMedia image={item.image} className={classes.media} />
        )}
        <CardContent className={classes.cardContent}>
          <Typography variant="body2" gutterBottom={true}>
            {item.description}
          </Typography>
          <Typography
            variant="caption"
            className={classes.sub}
            color="textSecondary"
          >
            {/* <div className="sub"> */}
            {item.icon && <img className={classes.icon} src={item.icon} />}
            {item.url}
            {item.minutes && (
              <div className={classes.readTime}>
                {Math.ceil(item.minutes)}
                {' min'}
              </div>
            )}
            {/* </div> */}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ItemCard;
