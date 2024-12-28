'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: boolean}>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out any directory entries that might slip through
    const validFiles = acceptedFiles.filter(file => file.size > 0);
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.json'],
    },
  });

  const handleDirectorySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size > 0);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const newProgress = {} as {[key: string]: boolean};
    
    try {
      for (const file of files) {
        try {
          const content = await file.text();
          const response = await fetch('/api/resources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              content,
              filename: file.name,
              path: file.webkitRelativePath || file.name
            }),
          });

          if (!response.ok) {
            console.error('Failed to upload file:', file.name);
            newProgress[file.name] = false;
          } else {
            newProgress[file.name] = true;
          }
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          newProgress[file.name] = false;
        }
        setUploadProgress(prev => ({ ...prev, ...newProgress }));
      }
    } finally {
      setIsUploading(false);
      // Clear successfully uploaded files
      const failedFiles = files.filter(file => !newProgress[file.name]);
      setFiles(failedFiles);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop files or folders here ...</p>
          ) : (
            <div className="space-y-2">
              <p>Drag 'n' drop files or folders here</p>
              <p className="text-sm text-muted-foreground">
                or use one of the options below
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <input
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                  id="folder-input"
                  onChange={handleDirectorySelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('folder-input')?.click()}
                >
                  Choose Folder
                </Button>
              </div>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">
                      {file.webkitRelativePath || file.name}
                    </p>
                    {uploadProgress[file.name] !== undefined && (
                      <p className={`text-xs ${uploadProgress[file.name] ? 'text-green-600' : 'text-red-600'}`}>
                        {uploadProgress[file.name] ? 'Uploaded' : 'Failed'}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleUpload} 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading 
                ? `Uploading... (${Object.values(uploadProgress).filter(Boolean).length}/${files.length})`
                : `Upload ${files.length} file${files.length === 1 ? '' : 's'}`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 