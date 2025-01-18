import React, { useState, DragEvent } from 'react';
import './ImageUploader.scss';

interface ImageUploaderProps {
    onFileUpload: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    // Handle file upload
    const handleFileUpload = (file: File) => {

        const url = URL.createObjectURL(file);
        onFileUpload(url);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <div
            className={`uploader-box ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            {/* {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : ( */}
                <div className="uploader-content">
                    <p>{`Click or Drag & Drop to Upload`}</p>
                    <p className="uploader-icon">📤</p>
                </div>
            {/* )} */}
            <input
                type="file"
                id="fileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default ImageUploader;
