export default function GroupContent() {
    return (
        <div className="bg-transparent h-full p-4 flex flex-col space-y-4 overflow-y-auto">
            <div className="text-white font-semibold text-xl">Groups</div>
            <div className="w-full ">
                <div className="flex justify-between">
                    <div className="flex space-x-4">
                        <div className="bg-transparent rounded-full">
                            <img
                                src="/b.jpg"
                                alt=""
                                className="w-14 h-14 rounded-full object-cover" />
                        </div>
                        <div>
                            <div className="text-white font-semibold text-lg">Friends Reunion</div>
                            <div className="text-gray-400">Hey guys. was sup</div>
                        </div>
                    </div>
                    <div>
                        <div>Today, 5:27pm</div>
                    </div>
                </div>
            </div>
        </div>
    )
}