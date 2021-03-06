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
import { audit } from '@/lib/audit';

export interface ItemsListProps {
  items: firebase.firestore.QueryDocumentSnapshot<Item>[];
  className?: string;
}

const ItemsList = ({ className, items, ...props }: ItemsListProps) => {
  return (
    <div className={className}>
      {items.map((i) => (
        <ItemCard
          key={i.id}
          item={i.data()!}
          layout="horizontal"
          withActions={true}
          style={{
            marginBottom: 8,
            maxWidth: 720,
            width: '100%',
            overflow: 'hidden',
          }}
          onArchive={() => archiveItem(i)}
          onUnarchive={() => unarchiveItem(i)}
          onDelete={() => deleteItem(i)}
          onPin={() => pinItem(i)}
          onUnpin={() => unpinItem(i)}
          onClick={() => audit(i.ref, 'open', {}, i.data(), i.data())}
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
