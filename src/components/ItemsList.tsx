import React from 'react';
import { FixedSizeList } from 'react-window';

import { Item } from '@/lib/Item';
import ItemsListItem from './ItemsListItem';

export interface ItemsListProps {
  items: Item[];
}

const ItemsList = ({ items, ...props }: ItemsListProps) => {
  return (
    <FixedSizeList
      width={'100%'}
      height={800}
      itemCount={items.length}
      itemSize={120}
    >
      {({ index, style }) => (
        <ItemsListItem style={style} item={items[index]} />
      )}
    </FixedSizeList>
  );
};

export default ItemsList;
