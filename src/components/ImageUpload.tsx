
import { UploadButton, UploadDropzone } from "../utils/uploadthing";
import { useState } from "react";
import { X } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url?: string) => void;
    endpoint?: "imageUploader";
}

export const ImageUpload = ({ value, onChange, endpoint = "imageUploader" }: ImageUploadProps) => {
    const [error, setError] = useState<string>("");

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
                onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    if (res && res[0]) {
                        onChange(res[0].url);
                        setError("");
                    }
                }}
                onUploadError={(error: Error) => {
                    // Do something with the error.
                    console.error(`ERROR! ${error.message}`);
                    setError(error.message);
                }}
                appearance={{
                    button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-auto",
                    container: "w-max flex-col items-center gap-1",
                    allowedContent: "text-xs text-muted-foreground"
                }}
                content={{
                    button: "Upload Image"
                }}
            />
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
    );
};
