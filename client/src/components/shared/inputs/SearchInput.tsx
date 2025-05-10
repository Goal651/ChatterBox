export default function SearchInput({ searchTerm, onSearchChange }: { searchTerm: string, onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="relative w-full">
            <input
                type="search"
                placeholder="Search friends or groups..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full px-5 py-3 pl-12 bg-gray-100/80 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 placeholder-gray-800 shadow-md"
            />
            <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gray"
                strokeWidth="2"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
            </svg>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                <kbd className="kbd kbd-sm bg-gray-300 text-gray-800">⌘</kbd>
                <kbd className="kbd kbd-sm bg-gray-300 text-gray-800">K</kbd>
            </div>
        </div>)
};
