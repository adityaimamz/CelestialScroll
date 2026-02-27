import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl as string, supabaseKey as string);

export default async function handler(req: Request, res: Response) {
    try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        // Fetch novels
        const { data: novels, error: novelsError } = await supabase
            .from('novels')
            .select('slug, updated_at')
            .eq('is_published', true);

        if (novelsError) {
            console.error("Error fetching novels:", novelsError);
            throw novelsError;
        }

        // Fetch chapters
        const { data: chapters, error: chaptersError } = await supabase
            .from('chapters')
            .select('novel_id, chapter_number, created_at, novels!inner(slug, is_published)')
            .eq('novels.is_published', true);

        if (chaptersError) {
            console.error("Error fetching chapters:", chaptersError);
            throw chaptersError;
        }

        const urls: string[] = [];

        // Base URL
        urls.push(`
            <url>
                <loc>${baseUrl}/</loc>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
            </url>
        `);

        // Novels URLs
        novels?.forEach((novel) => {
            urls.push(`
            <url>
                <loc>${baseUrl}/novel/${novel.slug}</loc>
                <lastmod>${new Date(novel.updated_at).toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
            `);
        });

        // Chapters URLs
        chapters?.forEach((chapter: any) => {
            const novelSlug = chapter.novels?.slug;
            if (novelSlug) {
                urls.push(`
                <url>
                    <loc>${baseUrl}/novel/${novelSlug}/chapter/${chapter.chapter_number}</loc>
                    <lastmod>${new Date(chapter.created_at).toISOString()}</lastmod>
                    <changefreq>never</changefreq>
                    <priority>0.6</priority>
                </url>
                `);
            }
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.status(200).send(sitemap.trim());
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
}
