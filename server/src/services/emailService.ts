import axios from "axios"

interface EmailSenderProps {
    username: string;
    email: string;
    verificationToken: string
    title: string;
}

const sendEmail = async ({ username, email, verificationToken, title }: EmailSenderProps): Promise<string> => {
    if (!username || !email || !verificationToken) {
        throw new Error("All fields are required.");
    }

    try {
        const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                to_email: email,
                to_name: username,
                verification_link: 'https://chatter-box-three.vercel.app/verify/' + verificationToken,
                message_title: title,
            },
            accessToken: process.env.EMAILJS_PRIVATE_KEY
        })


        if (response.status === 200) return "Email sent successfully.";
        else throw new Error("Error sending email.");
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error(error?.response?.data)
        }
        throw new Error("An error occurred while sending the email.");
    }
}


export default {
    sendEmail,
}