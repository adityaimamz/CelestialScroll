
import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "../../api/uploadthing";
import { supabase } from "@/integrations/supabase/client";

// Custom fetch wrapper untuk menyisipkan header Authorization berisi token sesi Supabase
const authFetch: typeof fetch = async (input, init) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (session?.access_token) {
            headers.set("Authorization", `Bearer ${session.access_token}`);
        }
        return fetch(input, {
            ...init,
            headers,
        });
    } catch {
        return fetch(input, init);
    }
};

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
    url: "/api/uploadthing",
    fetch: authFetch,
});

export const UploadButton = generateUploadButton<OurFileRouter>({
    url: "/api/uploadthing",
    fetch: authFetch,
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
    url: "/api/uploadthing",
    fetch: authFetch,
});

