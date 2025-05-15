import { ReactNode } from "react";
import SettingNavigation from "../../components/shared/settings/Navigation";

export default function SettingsLayout({ children }: { children: ReactNode }) {

    return (
        <div className="flex w-full bg-[#0f0f0f] h-screen gap-x-10 p-4">
            <SettingNavigation />
            <div>{children}</div>
        </div>
    )
}