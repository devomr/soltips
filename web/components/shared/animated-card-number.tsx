import React, { ReactNode } from 'react';

interface AnimatedCardNumberProps {
    value: number;
    label: string;
    suffix?: string;
    icon: ReactNode;
}

const AnimatedCardNumber = ({ value, label, suffix = '', icon }: AnimatedCardNumberProps) => {

    return (
        <div className="p-4 bg-white rounded shadow-sm dark:bg-gray-800 border-2 border-gray-100">
            <div className="flex items-center mb-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value} {suffix}
                </div>
            </div>
            <div className="text-base text-gray-500 flex items-center gap-2">
                {icon} {label}
            </div>
        </div>
    );
};

export default AnimatedCardNumber;
