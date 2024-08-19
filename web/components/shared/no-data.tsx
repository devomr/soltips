import React, { ReactNode } from 'react';

type NoDataProps = {
    className?: string;
    children?: ReactNode;
};

const NoData = ({ className, children }: NoDataProps) => {
    return (
        <div className={`text-center text-slate-900 bg-slate-100 rounded-md p-4 ${className}`}>
            {children}
        </div>
    );
};

export default NoData;
