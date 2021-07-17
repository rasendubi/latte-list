import React from 'react';

import AddDialog from '@/components/AddDialog';

export interface AddProps {}

const Add = ({}: AddProps) => {
  return <AddDialog fullScreen={true} open={true} />;
};

export default Add;
