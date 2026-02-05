'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/clientConfig';
import { apiCall } from '@/lib/api/client';
import Image from 'next/image';
import { 
  FolderPlus, 
  FilePlus, 
  MagnifyingGlass, 
  ArrowsClockwise,
  SignOut,
  Funnel,
  CheckCircle,
  Clock,
  CalendarBlank,
  FileArrowUp,
  SortAscending,
  SortDescending,
  CurrencyDollar,
  ChartBar,
  Lightning
} from '@phosphor-icons/react/dist/ssr';

interface RibbonProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | 'scanned' | 'unscanned';
  onFilterChange: (status: 'all' | 'scanned' | 'unscanned') => void;
  sortBy: 'name-asc' | 'name-desc' | 'date' | 'size';
  onSortChange: (sort: 'name-asc' | 'name-desc' | 'date' | 'size') => void;
  refreshTrigger?: number;
}

export default function Ribbon({ 
  onCreateFolder, 
  onUploadFile, 
  onRefresh,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  refreshTrigger
}: RibbonProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCost: number;
    scannedCount: number;
    averageCostPerScan: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiCall('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('stats load failed:', error);
      }
    };
    
    fetchStats();
  }, [refreshTrigger]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo-nia-automation.jpg" 
              alt="NIA Automation" 
              width={32}
              height={32}
              className="rounded object-cover"
            />
            <div>
              <h1 className="text-sm font-bold text-gray-900">NIA Automation</h1>
              <p className="text-xs text-gray-500">Operations & Maintenance</p>
            </div>
          </div>

          {stats && (
            <>
              <div className="w-px h-10 bg-gray-300 mx-2" />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded">
                  <Lightning weight="fill" className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-mono font-semibold">
                      {(stats.totalInputTokens / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-emerald-500">Input</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded">
                  <ChartBar weight="fill" className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-mono font-semibold">
                      {(stats.totalOutputTokens / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-emerald-500">Output</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded">
                  <CurrencyDollar weight="fill" className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-mono font-semibold">
                      ₱{(stats.totalCost * 58).toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-500">Total Cost</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded">
                  <div>
                    <p className="text-xs text-emerald-700 font-mono font-semibold">
                      {stats.scannedCount}
                    </p>
                    <p className="text-xs text-emerald-500">Scans</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
        >
          <SignOut weight="regular" className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateFolder}
            className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-white rounded transition group"
          >
            <FolderPlus weight="regular" className="w-6 h-6 text-emerald-800" />
            <span className="text-xs text-gray-700">New Folder</span>
          </button>

          <button
            onClick={onUploadFile}
            className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-white rounded transition group"
          >
            <FilePlus weight="regular" className="w-6 h-6 text-emerald-800" />
            <span className="text-xs text-gray-700">Upload PDF</span>
          </button>

          <div className="w-px h-10 bg-gray-300 mx-2" />

          <button
            onClick={onRefresh}
            className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-white rounded transition group"
          >
            <ArrowsClockwise weight="regular" className="w-6 h-6 text-gray-700" />
            <span className="text-xs text-gray-700">Refresh</span>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-1.5">
              <MagnifyingGlass weight="regular" className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="outline-none text-sm text-gray-700 w-64"
              />
            </div>

            <FilterDropdown 
              filterStatus={filterStatus}
              onFilterChange={onFilterChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ 
  filterStatus, 
  onFilterChange,
  sortBy,
  onSortChange
}: { 
  filterStatus: 'all' | 'scanned' | 'unscanned';
  onFilterChange: (status: 'all' | 'scanned' | 'unscanned') => void;
  sortBy: 'name-asc' | 'name-desc' | 'date' | 'size';
  onSortChange: (sort: 'name-asc' | 'name-desc' | 'date' | 'size') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="p-2 bg-white border border-gray-300 rounded hover:border-emerald-800 transition-colors"
      >
        <Funnel weight="regular" className="w-4 h-4 text-gray-700" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter by Status</p>
        </div>
        
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFilterChange('all')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            filterStatus === 'all' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <CheckCircle weight="regular" className="w-4 h-4" />
          All Files
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFilterChange('scanned')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            filterStatus === 'scanned' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <CheckCircle weight="regular" className="w-4 h-4 text-green-600" />
          Scanned
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFilterChange('unscanned')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            filterStatus === 'unscanned' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <Clock weight="regular" className="w-4 h-4 text-yellow-600" />
          Unscanned
        </button>

        <div className="px-3 py-2 bg-gray-50 border-t border-b border-gray-200 mt-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sort by</p>
        </div>

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSortChange('name-asc')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            sortBy === 'name-asc' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <SortAscending weight="regular" className="w-4 h-4" />
          Name (A-Z)
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSortChange('name-desc')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            sortBy === 'name-desc' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <SortDescending weight="regular" className="w-4 h-4" />
          Name (Z-A)
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSortChange('date')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            sortBy === 'date' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <CalendarBlank weight="regular" className="w-4 h-4" />
          Upload Date
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSortChange('size')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
            sortBy === 'size' ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
          }`}
        >
          <FileArrowUp weight="regular" className="w-4 h-4" />
          File Size
        </button>
      </div>
    </div>
  );
}
