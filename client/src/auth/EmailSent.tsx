import { useSearchParams } from "react-router-dom";

const EmailSent = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    return (
        <div className="flex items-center justify-center h-screen bg-slate-800">
            <div className="p-20 bg-slate-950 shadow-lg rounded-lg text-center">
                <h2 className="text-xl font-semibold">Verification Email Sent</h2>
                <p className="mt-2 text-gray-600">
                    A verification email has been sent to <span className="font-bold">{email}</span>. Please check your inbox and click the link to verify your email.
                </p>
                <p className="mt-2 text-gray-500">If you don't see the email, check your spam folder.</p>
            </div>
        </div>
    );
};

export default EmailSent;
