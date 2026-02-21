"use client";

import React, { useRef } from "react";

type FileUploadProps = {
  id: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export default function FileUpload({ id, files, onFilesChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    onFilesChange(nextFiles);
  };

  return (
    <div className="space-y-3">
      <label className="label" htmlFor={id}>
        Supporting Files <span className="muted">(Optional, Max 50, 25MB each)</span>
      </label>
      <button
        type="button"
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
      >
        <span className="upload-title">Click to upload files</span>
        <span className="upload-subtitle">Images, Video, Audio, PDF, Code, Text</span>
      </button>
      <input
        id={id}
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,audio/*,application/pdf,text/*,.log,.json,.xml,.yaml,.yml,.js,.ts,.tsx,.jsx,.css,.scss,.html,.md,.csv,.sql,.sh,.bat,.rtf,.c,.cpp,.h,.hpp,.cs,.swift,.kt,.gradle,.properties,.ini,.rb,.go,.rs,.php,.java"
        onChange={handleInputChange}
      />
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file) => (
            <div key={`${file.name}-${file.lastModified}`} className="file-item">
              <span>{file.name}</span>
              <span className="muted">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
