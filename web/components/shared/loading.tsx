import { IconLoader2 } from '@tabler/icons-react';

type LoadingSpinnerProps = {
    message?: string;
    className?: string;
};

const LoadingSpinner = ({ message, className }: LoadingSpinnerProps) => {
    return (
        <div className={`flex flex-col items-center justify-center text-slate-800 ${className}`}>
            <div className="animate-spin">
                <IconLoader2 size={48} />
            </div>
            {message && <p className="mt-4 text-lg">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;