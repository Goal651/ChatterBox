"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("uploadthing/express");
const f = (0, express_1.createUploadthing)();
exports.uploadRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).onUploadComplete((data) => {
        console.log("upload completed", data);
    }),
};
