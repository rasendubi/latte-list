import React from 'react';
// import { FixedSizeList } from 'react-window';

import firebase from '@/firebase/client';

import { Item } from '@/lib/Item';
import ItemCard from '@/components/ItemCard';
import {
  archiveItem,
  deleteItem,
  pinItem,
  unarchiveItem,
  unpinItem,
} from '@/lib/items';

export interface ItemsListProps {
  items: firebase.firestore.QueryDocumentSnapshot<Item>[];
}

const ItemsList = ({ items, ...props }: ItemsListProps) => {
  return (
    <div>
      {items.map((i) => (
        <ItemCard
          key={i.id}
          item={i.data()!}
          layout="horizontal"
          withActions={true}
          style={{ margin: 8, maxWidth: 720 }}
          onArchive={() => archiveItem(i)}
          onUnarchive={() => unarchiveItem(i)}
          onDelete={() => deleteItem(i)}
          onPin={() => pinItem(i)}
          onUnpin={() => unpinItem(i)}
        />
      ))}
    </div>
  );

  // TODO: Properly use react-window. This also involves properly
  // querying firestore and getting items with offset. For now, it’s
  // just premature optimization
  // return (
  //   <FixedSizeList
  //     width={'100%'}
  //     height={800}
  //     itemCount={items.length}
  //     itemSize={152 + 16}
  //   >
  //     {({ index, style }) => (
  //       <div
  //         style={{
  //           padding: 8,
  //           ...style,
  //         }}
  //       >
  //         <ItemCard
  //           item={items[index]}
  //           layout="horizontal"
  //           withActions={true}
  //           style={{ width: '100%', height: '100%' }}
  //         />
  //       </div>
  //     )}
  //   </FixedSizeList>
  // );
};

export default ItemsList;
