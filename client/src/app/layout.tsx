import type { ReactNode } from 'react';
import SideBar from '../components/sidebar';
type LayoutProps = { children: ReactNode }

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex ">
            <SideBar />
            <main>{children}</main>
        </div>
    );
};

export default Layout;