import PhotoCapture from "../utilities/PhotoCapture";

export default function MediaTester() {
    return (
        <div className="w-full h-screen bg-slate-600 flex items-center justify-center">
            <div className="text-9xl">
                Testing area
            </div>
            <PhotoCapture onPhotoCapture={() => { }} />
            <a
                className="link"
                href="/">
                Return home
            </a>
        </div>
    )
}