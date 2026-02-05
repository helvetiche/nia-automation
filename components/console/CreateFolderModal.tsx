'use client';

import { useState } from 'react';
import { 
  FolderPlus,
  Folder,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image as ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera
} from '@phosphor-icons/react/dist/ssr';
import { apiCall } from '@/lib/api/client';
import Modal from '@/components/Modal';

interface CreateFolderModalProps {
  currentFolder: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
];

const ICONS = [
  { name: 'Folder', component: Folder },
  { name: 'FolderOpen', component: FolderOpen },
  { name: 'Archive', component: Archive },
  { name: 'BookBookmark', component: BookBookmark },
  { name: 'Briefcase', component: Briefcase },
  { name: 'ChartBar', component: ChartBar },
  { name: 'FileText', component: FileText },
  { name: 'Gear', component: Gear },
  { name: 'Heart', component: Heart },
  { name: 'House', component: House },
  { name: 'Image', component: ImageIcon },
  { name: 'Lightning', component: Lightning },
  { name: 'MusicNote', component: MusicNote },
  { name: 'Star', component: Star },
  { name: 'Users', component: Users },
  { name: 'VideoCamera', component: VideoCamera },
];

export default function CreateFolderModal({
  currentFolder,
  onClose,
  onSuccess,
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedIcon, setSelectedIcon] = useState('Folder');

  const createFolder = async () => {
    if (!name.trim()) return;

    if (description.length > 50) {
      return;
    }

    setCreating(true);
    try {
      const response = await apiCall('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: currentFolder,
          color: selectedColor,
          icon: selectedIcon,
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('folder creation failed:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Folder"
      description="Organize your PDFs by creating folders. You can nest folders up to 4 levels deep."
      icon={<FolderPlus weight="regular" className="w-5 h-5" />}
      maxWidth="md"
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this folder (max 50 characters)"
            rows={2}
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length} / 50 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-lg ${color.class} transition-all ${
                  selectedColor === color.value
                    ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
            {ICONS.map((icon) => {
              const IconComponent = icon.component;
              return (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === icon.name
                      ? 'bg-emerald-100 ring-2 ring-emerald-800 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                  }`}
                  title={icon.name}
                >
                  <IconComponent weight="regular" className="w-5 h-5 text-gray-700" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200">
        <button
          data-modal-close="true"
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Nevermind
        </button>
        <button
          onClick={createFolder}
          disabled={creating || !name.trim() || description.length > 50}
          className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50 transition text-sm font-medium"
        >
          {creating ? 'Creating...' : 'Create Folder'}
        </button>
      </div>
    </Modal>
  );
}
