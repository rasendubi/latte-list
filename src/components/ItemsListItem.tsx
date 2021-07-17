import React from 'react';
import { Item } from '@/lib/Item';

export interface ItemsListItemProps {
  item: Item;
  style: React.CSSProperties;
}

const ItemsListItem = ({ item, style }: ItemsListItemProps) => {
  const hostname = new URL(item.url).hostname.replace(/^www\./, '');
  return (
    <a className="root" style={style} href={item.url}>
      <div className="content">
        <h2 className="title">{item.title}</h2>
        <div className="description-wrapper">
          <div className="description">{item.description}</div>
        </div>
        <div className="sub">
          {item.icon && <img className="icon" src={item.icon} />}
          <div className="hostname">{hostname}</div>
          {item.minutes ? (
            <div className="read-time">
              {Math.ceil(item.minutes)}
              {' min'}
            </div>
          ) : null}
        </div>
      </div>
      {item.image && (
        <div className="image">
          <img src={item.image} />
        </div>
      )}
      <style jsx>{`
        .root {
          display: flex;
          width: 100%;
          border-bottom: 1px solid #ccc;
          text-decoration: unset;
          color: unset;
          padding: 0 8px;
        }
        .content {
          flex: auto;
          display: flex;
          flex-direction: column;
          // height: ${style.height}px;
          // max-height: ${style.height}px;
          // height: 100%;
          min-width: 60vw;
          padding: 4px;
        }
        .title {
          display: -webkit-box;
          font-size: 18px;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-shrink: 0;
          margin: 0 0 4px;
        }
        .description-wrapper {
          flex: auto;
          overflow: hidden;
        }
        .description {
          display: -webkit-box;
          // flex-grow: 1;
          flex-shrink: 1;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sub {
          margin: 4px 0;
          font-size: 12px;
          color: #777;
          display: flex;
        }
        .icon {
          margin-right: 4px;
          // max-height: 1em;
          /* 1em * line-height */
          max-height: calc(1em * 1.2);
        }
        .hostname {
          // flex-grow: 0;
          // flex-shrink: 1;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .read-time::before {
          margin: 0 4px;
          content: '·';
        }
        .read-time {
          white-space: nowrap;
        }
        .image {
          width: calc(min(200px, 40vw));
          padding: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          border-left: 1px solid #eee;
        }
        .image img {
          width: 100%;
          height: 100%;
          max-height: ${(style.height as number) - 1}px;
          object-fit: cover;
          object-fit: contain;
        }
      `}</style>
    </a>
  );
};

export default ItemsListItem;
