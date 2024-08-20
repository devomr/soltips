// components/Layout.tsx
import { ReactNode } from 'react';
import Sidebar from './sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-4 md:p-10 bg-gray-100 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
