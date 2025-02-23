"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Upload } from "lucide-react";

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null);

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

        // TODO: Implement file upload logic here
        console.log("Uploading file:", file.name);

        // Reset the form after upload
        setFile(null);
        event.currentTarget.reset();
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
                />
            </div>
            <Button type="submit" disabled={!file}>
                <Upload className="mr-2 h-4 w-4" /> Upload CSV
            </Button>
        </form>
    );
}
