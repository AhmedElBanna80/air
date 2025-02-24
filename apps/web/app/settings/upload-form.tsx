"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Upload } from "lucide-react";
import { uploadAirQualityData } from "../../lib/api-client.js";

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
        } else {
            setFile(null);
            alert("Please select a valid CSV file.");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            alert("Please select a CSV file to upload.");
            return;
        }

        try {
            setUploading(true);
            await uploadAirQualityData(file);
            alert("Upload started successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setUploading(false);
            setFile(null);
            event.currentTarget.reset();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="csv-upload">Upload Air Quality Data</Label>
                <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    disabled={uploading}
                />
            </div>
            <Button type="submit" disabled={!file || uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload CSV"}
            </Button>
        </form>
    );
}
