'use client';

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { apiCall } from '@/lib/api/client';
import { FileXls, Upload, X } from '@phosphor-icons/react';

interface Template {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: number;
}

interface TemplateModalProps {
  onClose: () => void;
  onSelectTemplate: (templateId: string | null) => void;
}

export default function TemplateModal({ onClose, onSelectTemplate }: TemplateModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiCall('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('templates load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadTemplate = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace('.xlsx', ''));

      const response = await apiCall('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadTemplates();
      } else {
        alert('upload failed');
      }
    } catch (error) {
      console.error('template upload broken:', error);
      alert('upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateReport = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export to Excel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X weight="regular" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Template (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadTemplate(file);
              }}
              className="hidden"
              id="template-upload"
              disabled={uploading}
            />
            <label
              htmlFor="template-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload weight="regular" className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload Excel template'}
              </span>
              <span className="text-xs text-gray-500">.xlsx files only</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates uploaded yet
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`w-full p-3 rounded-lg border-2 transition text-left ${
                  selectedTemplate === null
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileXls weight="regular" className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Default Template</p>
                    <p className="text-xs text-gray-500">Use system default</p>
                  </div>
                </div>
              </button>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full p-3 rounded-lg border-2 transition text-left ${
                    selectedTemplate === template.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileXls weight="regular" className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(template.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
          >
            Generate Report
          </button>
        </div>
      </div>
    </Modal>
  );
}
