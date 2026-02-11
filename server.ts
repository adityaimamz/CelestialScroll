import "dotenv/config";
import express from "express";
import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "./api/uploadthing";

const app = express();
const port = 3000;

app.use(
    "/api/uploadthing",
    createRouteHandler({
        router: ourFileRouter,
        config: {
            token: process.env.UPLOADTHING_TOKEN,
        },
    })
);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
