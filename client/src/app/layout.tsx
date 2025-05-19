import { useEffect, type ReactNode } from 'react';
import SideBar from '../components/sidebar';
import { useNavigate } from 'react-router-dom';
import { notify } from '@/utils/NotificationService';
import { fetchUserProfile } from '@/api/UserApi';
import { SocketProvider } from '@/context/SocketContext';

export default function Layout({ children }: { children: ReactNode }) {
    const router = useNavigate()

    useEffect(() => {
        const fetchDetails = async () => {
            await fetchUserProfile()
        }
        fetchDetails()
    }, [])


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            notify("You are not logged in", "error")
            router('/login')
        }
    }, [router])
    
    return (
        <SocketProvider status={true}>
            <div className="flex bg-white h-screen w-screen overflow-hidden">
                <SideBar />
                <main className='w-full h-full'>{children}</main>
            </div>{/* Your app components here */}
        </SocketProvider>
    );
};
