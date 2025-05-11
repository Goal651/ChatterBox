import ReactPlayer from "react-player";

export default function StyledAudioPlayer({ url }: { url: string }) {
    return (
        <div className="w-full p-4 bg-gray-800 rounded-lg shadow-md">
            <ReactPlayer
                url={url}
                playing={false}
                controls
                width="100%"
                height="50px"
                style={{ borderRadius: "8px", backgroundColor: "#333" }}
            />
        </div>
    );
}
