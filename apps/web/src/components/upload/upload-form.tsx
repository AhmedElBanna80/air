import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { uploadCsvFile } from '@/lib/api';
import { AlertCircle, Check, FileIcon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate upload progress
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 95) {
          clearInterval(interval);
          return 95;
        }
        return newProgress;
      });
    }, 300);
    return interval;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setUploadStatus('idle');
      setMessage('');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setMessage('Only CSV files are allowed');
      return;
    }

    try {
      setUploadStatus('uploading');
      const progressInterval = simulateProgress();
      
      // Perform the upload
      const result = await uploadCsvFile(file);
      
      // Complete the progress bar
      clearInterval(progressInterval);
      setProgress(100);
      
      // Set result status
      if (result.success) {
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
      
      setMessage(result.message);
    } catch (error) {
      setUploadStatus('error');
      setMessage('An error occurred during upload. Please try again.');
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setProgress(0);
    setMessage('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Air Quality Data</CardTitle>
        <CardDescription>
          Upload CSV files with air quality measurements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadStatus === 'success' ? (
          <Alert className="mb-6 bg-green-50 dark:bg-green-950/30">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : uploadStatus === 'error' ? (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {(uploadStatus === 'idle' || uploadStatus === 'error') && (
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/40 transition-all"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center gap-2">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
              
              <div className="mb-4 mt-2">
                <h3 className="font-semibold text-lg">Drag & Drop your file here</h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse (CSV files only)
                </p>
              </div>

              <Input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
        )}

        {file && (uploadStatus === 'idle' || uploadStatus === 'error') && (
          <div className="mt-4 p-4 border rounded-md">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetUpload}
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <UploadIcon className="h-5 w-5 text-primary animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading {file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {file && (uploadStatus === 'idle' || uploadStatus === 'error') ? (
          <>
            <Button variant="outline" onClick={resetUpload}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </>
        ) : uploadStatus === 'success' ? (
          <Button onClick={resetUpload} className="ml-auto">
            Upload Another File
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}