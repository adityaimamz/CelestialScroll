
import { UploadButton } from "../utils/uploadthing";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
    value?: string;
    onChange: (url?: string) => void;
    endpoint?: "imageUploader";
}

export const ImageUpload = ({ value, onChange, endpoint = "imageUploader" }: ImageUploadProps) => {
    const [error, setError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    if (value) {
        return (
            <div className="relative w-40 h-40 overflow-hidden rounded-md border border-input bg-background">
                <img
                    src={value}
                    alt="Upload"
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => onChange(undefined)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm hover:bg-destructive/90 transition-colors"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <UploadButton
                endpoint={endpoint}
                onUploadBegin={() => {
                    setIsUploading(true);
                    setUploadProgress(0);
                    setError("");
                }}
                onUploadProgress={(p) => {
                    setUploadProgress(p);
                }}
                onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    setUploadProgress(100);
                    // Do something with the response
                    console.log("Files: ", res);
                    const uploadedFile = res?.[0];
                    if (uploadedFile) {
                        const optimizedUrl = uploadedFile.serverData?.webpUrl;
                        const wasConverted = uploadedFile.serverData?.wasConverted;
                        const originalType = uploadedFile.serverData?.originalType;

                        // Use optimized URL if available, otherwise fall back to the uploaded file URL
                        // eslint-disable-next-line deprecation/deprecation
                        const fileUrl = optimizedUrl || uploadedFile.url;

                        onChange(fileUrl);

                        if (optimizedUrl && wasConverted) {
                            console.log(`✓ Image optimized to WebP from ${originalType}:`, optimizedUrl);
                        } else if (optimizedUrl && !wasConverted) {
                            console.log(`✓ Using ${originalType} (already optimized):`, optimizedUrl);
                        } else {
                            console.warn(`⚠ Optimization unavailable, using ${originalType}`);
                        }
                        setError("");
                    }
                }}
                onUploadError={(error: Error) => {
                    setIsUploading(false);
                    // Do something with the error.
                    console.error(`ERROR! ${error.message}`);
                    setError(error.message);
                }}
                appearance={{
                    button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-auto",
                    container: "w-max flex-col items-start gap-1",
                    allowedContent: "hidden"
                }}
                content={{
                    button: "Upload Image"
                }}
            />
            {isUploading && (
                <div className="w-40 mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading...
                        </span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5 w-full bg-muted" />
                </div>
            )}
            {error && !isUploading && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
    );
};
