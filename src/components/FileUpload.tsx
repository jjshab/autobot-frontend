import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';
import { Alert, CircularProgress } from '@mui/material';

// Import FilePond plugins
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileMetadata from 'filepond-plugin-file-metadata';

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginFileMetadata
);

interface FileUploadProps {
  arbitrationCaseId: string;
}

interface FileStatus {
  name: string;
  status: 'uploading' | 'success' | 'error';
  message?: string;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ arbitrationCaseId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  const updateFileStatus = (name: string, status: Partial<FileStatus>) => {
    setFileStatuses(prev => {
      const existing = prev.findIndex(f => f.name === name);
      if (existing >= 0) {
        const newStatuses = [...prev];
        newStatuses[existing] = { ...newStatuses[existing], ...status };
        return newStatuses;
      }
      return [...prev, { name, ...status } as FileStatus];
    });
  };

  const handleFileUpload = async (fileItems: any) => {
    setFiles(fileItems.map((fileItem: any) => fileItem.file));
    
    for (const fileItem of fileItems) {
      const fileName = fileItem.file.name;
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('arbitrationCaseId', arbitrationCaseId);

      // Initialize upload status
      updateFileStatus(fileName, {
        status: 'uploading',
        progress: 0
      });

      try {
        await axios.post('/api/uploadFile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            updateFileStatus(fileName, {
              status: 'uploading',
              progress
            });
          }
        });

        // Update success status
        updateFileStatus(fileName, {
          status: 'success',
          message: 'File uploaded successfully'
        });

        console.log(`File ${fileName} uploaded successfully`);
      } catch (error) {
        // Update error status
        updateFileStatus(fileName, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed'
        });
        console.error(`Error uploading file ${fileName}:`, error);
      }
    }
  };

  // Clear completed uploads after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFileStatuses(prev => prev.filter(status => status.status === 'uploading'));
    }, 5000);
    return () => clearTimeout(timer);
  }, [fileStatuses]);

  return (
    <div>
      <FilePond
        files={files}
        onupdatefiles={handleFileUpload}
        allowMultiple={true}
        maxFiles={10}
        acceptedFileTypes={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]}
        maxFileSize="100MB"
        labelIdle='Drag & Drop case documents or <span class="filepond--label-action">Browse</span>'
      />

      {/* Status indicators */}
      <div style={{ marginTop: '1rem' }}>
        {fileStatuses.map(({ name, status, message, progress }) => (
          <div key={name} style={{ marginBottom: '0.5rem' }}>
            {status === 'uploading' && (
              <Alert 
                icon={<CircularProgress size={20} />} 
                severity="info"
              >
                Uploading {name}: {progress}%
              </Alert>
            )}
            {status === 'success' && (
              <Alert severity="success">
                {name}: {message}
              </Alert>
            )}
            {status === 'error' && (
              <Alert severity="error">
                {name}: {message}
              </Alert>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
