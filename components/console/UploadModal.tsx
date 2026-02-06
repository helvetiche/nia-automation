"use client";

import { useState } from "react";
import {
  FilePlus,
  UploadSimple,
  FilePdf,
  X,
  Pencil,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { apiCall } from "@/lib/api/client";
import Modal from "@/components/Modal";

interface FileWithConfig {
  file: File;
  displayName: string;
  pageNumber: string;
}

interface UploadModalProps {
  currentFolder: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onUploadOptimistic?: (files: File[]) => void;
  onScanComplete?: (fileIds: string[]) => void;
}

export default function UploadModal({
  currentFolder,
  onClose,
  onSuccess,
  onUploadOptimistic,
  onScanComplete,
}: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithConfig[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList).map((file) => ({
      file,
      displayName: file.name.replace(/\.pdf$/i, ""),
      pageNumber: "1",
    }));

    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList)
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        file,
        displayName: file.name.replace(/\.pdf$/i, ""),
        pageNumber: "1",
      }));

    if (newFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const updatePageNumber = (index: number, value: string) => {
    const updated = [...selectedFiles];
    updated[index].pageNumber = value;
    setSelectedFiles(updated);
  };

  const startEditingName = (index: number) => {
    setEditingIndex(index);
    setEditingName(selectedFiles[index].displayName);
  };

  const saveEditedName = () => {
    if (editingIndex !== null && editingName.trim()) {
      const updated = [...selectedFiles];
      updated[editingIndex].displayName = editingName.trim();
      setSelectedFiles(updated);
    }
    setEditingIndex(null);
    setEditingName("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingName("");
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    if (onUploadOptimistic) {
      onUploadOptimistic(selectedFiles.map((f) => f.file));
    }

    const formData = new FormData();

    selectedFiles.forEach((fileConfig) => {
      formData.append("files", fileConfig.file);
    });

    if (currentFolder) {
      formData.append("folderId", currentFolder);
    }

    try {
      const response = await apiCall("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const fileIds = data.files.map((f: { id: string }) => f.id);
        setUploadedFileIds(fileIds);
        startScanning(fileIds);
      }
    } catch (error) {
      console.error("upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const startScanning = async (fileIds: string[]) => {
    setScanning(true);
    setScanProgress(0);

    try {
      const totalFiles = fileIds.length;

      for (let i = 0; i < fileIds.length; i++) {
        const fileId = fileIds[i];
        const fileConfig = selectedFiles[i];

        await apiCall("/api/files/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfId: fileId,
            scanType: "summary",
            pageNumbers: fileConfig.pageNumber,
            displayName: fileConfig.displayName,
          }),
        });

        setScanProgress(((i + 1) / totalFiles) * 100);
      }

      setScanning(false);
      setScanComplete(true);
    } catch (error) {
      console.error("scan failed:", error);
      setScanning(false);
    }
  };

  const createReport = () => {
    if (onScanComplete) {
      onScanComplete(uploadedFileIds);
    }
    onSuccess();
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        scanning
          ? "Scanning PDFs"
          : scanComplete
            ? "Scan Complete"
            : "Upload PDF Files"
      }
      description={
        scanning
          ? "Processing your files with AI..."
          : scanComplete
            ? "Your files have been scanned successfully"
            : "Configure scan settings for each file"
      }
      icon={<FilePlus weight="regular" className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {scanning ? (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scanning progress</span>
              <span className="font-semibold text-emerald-800">
                {Math.round(scanProgress)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Please wait while we process your files...
          </p>
        </div>
      ) : scanComplete ? (
        <div className="p-6 space-y-4">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Sparkle
                weight="fill"
                className="w-6 h-6 text-emerald-600"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Scan Complete!
              </h3>
              <p className="text-sm text-gray-600">
                {uploadedFileIds.length}{" "}
                {uploadedFileIds.length === 1 ? "file" : "files"} processed
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((fileConfig, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-200 hover:border-emerald-300 transition"
              >
                <FilePdf
                  weight="regular"
                  className="w-5 h-5 text-red-600 flex-shrink-0"
                />
                <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                  {fileConfig.displayName}.pdf
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircle
                    weight="fill"
                    className="w-5 h-5 text-emerald-600"
                  />
                  <span className="text-xs font-semibold text-emerald-700">
                    success
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Done
            </button>
            {uploadedFileIds.length >= 2 && (
              <button
                onClick={createReport}
                className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition text-sm font-medium"
              >
                Create Report
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="p-6 space-y-4">
            {selectedFiles.length === 0 ? (
              <label
                className={`flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDragging
                    ? "border-emerald-800 bg-emerald-50"
                    : "border-gray-300 hover:border-emerald-800"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadSimple
                  weight="regular"
                  className={`w-12 h-12 transition ${
                    isDragging ? "text-emerald-900" : "text-emerald-800"
                  }`}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragging
                      ? "Drop PDFs here"
                      : "Click to select or drag PDFs here"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 20 files, 50MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={selectFiles}
                  className="hidden"
                />
              </label>
            ) : (
              <div
                className="space-y-4"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div
                  className={`flex items-center justify-between transition ${
                    isDragging ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedFiles.length}{" "}
                      {selectedFiles.length === 1 ? "file" : "files"} selected
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isDragging
                        ? "Drop more PDFs to add them"
                        : "Configure page numbers and names for each file"}
                    </p>
                  </div>
                  <label className="text-xs text-emerald-800 hover:text-emerald-900 cursor-pointer font-medium px-3 py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition">
                    Add more
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={selectFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                {isDragging && (
                  <div className="absolute inset-0 bg-emerald-50/90 border-2 border-dashed border-emerald-800 rounded-lg flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-center">
                      <UploadSimple
                        weight="regular"
                        className="w-12 h-12 text-emerald-900 mx-auto mb-2"
                      />
                      <p className="text-sm font-semibold text-emerald-900">
                        Drop PDFs to add them
                      </p>
                    </div>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                  {selectedFiles.map((fileConfig, index) => (
                    <div
                      key={index}
                      className="group p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <FilePdf
                          weight="regular"
                          className="w-8 h-8 text-red-600 flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-2">
                            {editingIndex === index ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditedName();
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  className="flex-1 px-3 py-1.5 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  autoFocus
                                />
                                <button
                                  onClick={saveEditedName}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="flex-1 text-sm font-medium text-gray-900 truncate">
                                  {fileConfig.displayName}
                                </p>
                                <button
                                  onClick={() => startEditingName(index)}
                                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition"
                                  title="Rename"
                                >
                                  <Pencil
                                    weight="regular"
                                    className="w-4 h-4 text-gray-500"
                                  />
                                </button>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatFileSize(fileConfig.file.size)}</span>
                            <span>•</span>
                            <span>PDF Document</span>
                          </div>

                          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                              Page to scan:
                            </label>
                            <input
                              type="text"
                              value={fileConfig.pageNumber}
                              onChange={(e) =>
                                updatePageNumber(index, e.target.value)
                              }
                              placeholder="1"
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              <span className="hidden sm:inline">Use </span>
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                0
                              </span>
                              <span className="hidden sm:inline">
                                {" "}
                                for last page
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 leading-relaxed">
                            Examples:{" "}
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded mx-0.5">
                              1
                            </span>{" "}
                            (page 1),
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded mx-0.5">
                              1,3,5
                            </span>{" "}
                            (multiple),
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded mx-0.5">
                              1-5
                            </span>{" "}
                            (range)
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition flex-shrink-0"
                        >
                          <X
                            weight="regular"
                            className="w-5 h-5 text-red-600"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              data-modal-close="true"
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm font-medium"
            >
              Cancel
            </button>
            {selectedFiles.length > 0 && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50 transition text-sm font-medium shadow-sm"
              >
                {uploading
                  ? "Uploading..."
                  : `Upload & Scan ${selectedFiles.length} ${selectedFiles.length === 1 ? "File" : "Files"}`}
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
