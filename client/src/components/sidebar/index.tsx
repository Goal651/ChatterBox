import SideBarLocations from "./Locations";
import SideBarProfile from "./Profile";

export default function SideBar() {
    return (
        <div  className="flex flex-col">
            {/* SideBarProfile */}
            <SideBarProfile />
            {/* SideBarLocations */}
            <SideBarLocations />

        </div>
    )
}