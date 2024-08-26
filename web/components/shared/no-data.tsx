import React, { ReactNode } from 'react';

type NoDataProps = {
  className?: string;
  children?: ReactNode;
};

const NoData = ({ className, children }: NoDataProps) => {
  return (
    <div
      className={`rounded-md bg-slate-100 p-4 text-center text-slate-900 ${className}`}
    >
      {children}
    </div>
  );
};

export default NoData;
