import { generateUploadButton } from "@uploadthing/react";
import { serverUrl } from "../constants/constant";

export const UploadButton = generateUploadButton({
    url: serverUrl + "/uploadthing",
});
