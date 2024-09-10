import { IconLoader2 } from '@tabler/icons-react';
import { ReactNode } from 'react';

type LoadingSpinnerProps = {
  className?: string;
  children?: ReactNode;
};

export function LoadingSpinner({ className, children }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-md p-4 text-slate-900 ${className}`}
    >
      <div className="animate-spin">
        <IconLoader2 size={36} />
      </div>
      <p>{children}</p>
    </div>
  );
}
