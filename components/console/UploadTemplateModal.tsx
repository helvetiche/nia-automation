"use client";

import { useState } from "react";
import Modal from "../Modal";
import { apiCall } from "@/lib/api/client";
import { FileXls, Upload, X } from "@phosphor-icons/react";

interface UploadTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadTemplateModal({
  onClose,
  onSuccess,
}: UploadTemplateModalProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");

  const uploadTemplate = async () => {
    if (!selectedFile || !templateName.trim()) {
      alert("Please select a file and enter a name");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", templateName.trim());

      const response = await apiCall("/api/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("upload failed");
      }
    } catch (error) {
      console.error("template upload broken:", error);
      alert("upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Excel Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X weight="regular" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., LIPA Report 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    if (!templateName) {
                      setTemplateName(file.name.replace(".xlsx", ""));
                    }
                  }
                }}
                className="hidden"
                id="template-file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="template-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {selectedFile ? (
                  <>
                    <FileXls
                      weight="regular"
                      className="w-8 h-8 text-emerald-600"
                    />
                    <span className="text-sm text-gray-900 font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to change file
                    </span>
                  </>
                ) : (
                  <>
                    <Upload
                      weight="regular"
                      className="w-8 h-8 text-gray-400"
                    />
                    <span className="text-sm text-gray-600">
                      Click to upload Excel template
                    </span>
                    <span className="text-xs text-gray-500">
                      .xlsx files only
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={uploadTemplate}
            disabled={uploading || !selectedFile || !templateName.trim()}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Template"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
