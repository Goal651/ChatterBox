import type { ReactNode } from 'react';
import SideBar from '../components/shared/sidebar';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex bg-white h-screen w-screen">
            <SideBar />
            <main className='w-full h-full'>{children}</main>
        </div>
    );
};

export default Layout;