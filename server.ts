import "dotenv/config";
import express from "express";
import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "./api/uploadthing";
import { z } from "zod";
import sitemapHandler from "./api/sitemap";

const app = express();
const port = 3000;

const serverEnvSchema = z.object({
    UPLOADTHING_TOKEN: z.string().min(1),
});

const serverEnv = serverEnvSchema.safeParse(process.env);

if (!serverEnv.success) {
    console.error("Invalid server environment configuration:", serverEnv.error.flatten().fieldErrors);
    process.exit(1);
}

app.use(
    "/api/uploadthing",
    createRouteHandler({
        router: ourFileRouter,
        config: {
            token: serverEnv.data.UPLOADTHING_TOKEN,
        },
    })
);

// Serve dynamic sitemap
app.get("/sitemap.xml", async (req, res) => {
    try {
        await sitemapHandler(req, res);
    } catch (error) {
        console.error("Error loading sitemap handler:", error);
        res.status(500).send("Error generating sitemap");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
