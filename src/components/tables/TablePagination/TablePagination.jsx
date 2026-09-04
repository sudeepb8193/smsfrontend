import React from 'react';
import Pagination from '../../common/Pagination/Pagination';

export const TablePagination = (props) => {
  return (
    <div className="border-t border-white/10 pt-2">
      <Pagination {...props} />
    </div>
  );
};

export default TablePagination;
