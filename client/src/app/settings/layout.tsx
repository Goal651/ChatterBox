import { ReactNode } from "react";
import SettingNavigation from "@/components/settings/Navigation";

export default function SettingsLayout({ children }: { children: ReactNode }) {



    return (
        <div className="flex w-full bg-[#0f0f0f] h-screen gap-x-10 p-4 relative">
            <img src='/bg/all.png' className='absolute left-0 top-0 h-full w-full object-cover  opacity-1' />

            <SettingNavigation />
            <div className="z-5">{children}</div>
        </div>
    )
}