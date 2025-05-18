import axios from "axios";
import { serverUrl } from "../constants/constant";
import { GlobalApiErrorHandler } from "../error/ApiError";

// Fetch a user by their email address
export async function fetchUserByEmail(email: string) {
    try {
        const response = await axios.get(`${serverUrl}/getUser/${email}`, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined; // Ensure consistent return
    }
}

// Fetch the authenticated user's details
export async function fetchUserProfile() {
    try {
        const response = await axios.get(`${serverUrl}/getProfile`, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        localStorage.setItem('authenticatedUser', JSON.stringify(response.data.user));
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined;
    }
}

// Fetch all users and store in localStorage
export async function fetchAllUsers() {
    try {
        const response = await axios.get(`${serverUrl}/getUsers`, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        localStorage.setItem('users', JSON.stringify(response.data.users));
        return response.data; // Return data for consistency
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined;
    }
}

// Update the authenticated user's profile
export async function updateUserProfile(profileData: object) {
    try {
        const response = await axios.put(`${serverUrl}/editUserProfile`, profileData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined;
    }
}

// Update a specific user's data
export async function updateUser(userData: object) {
    try {
        const response = await axios.put(`${serverUrl}/updateUser`, userData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        return response.data; // Return response.data for consistency
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined;
    }
}

// Update the authenticated user's profile picture
export async function updateUserProfilePicture(finalFileName: string) {
    try {
        const response = await axios.put(
            `${serverUrl}/editUserProfilePicture`,
            { finalFileName },
            {
                headers: {
                    accesstoken: localStorage.getItem('token'),
                },
            }
        );
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error);
        return undefined;
    }
}