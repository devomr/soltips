import React, { ReactNode } from 'react';

type AlertProps = {
  className?: string;
  children?: ReactNode;
};

export function Alert({ className, children }: AlertProps) {
  return (
    <div role="alert" className={`rounded-md p-4 text-center ${className}`}>
      {children}
    </div>
  );
}
