'use client';

import { useState } from 'react';
import { Upload, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface TableRow {
  [key: string]: string | number;
}

interface ExtractedPage {
  pageNumber: number;
  tableData: TableRow[];
  summary: string;
}

interface TestResult {
  stage: string;
  status: 'pending' | 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'fast' | 'thorough'>('fast');
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setResults([]);
    }
  };

  const runTest = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResults([]);
    setExtractedPages([]);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('strategy', strategy);

    try {
      const response = await fetch('/api/test/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults(data.results || []);
      setExtractedPages(data.extractedPages || []);
    } catch (error) {
      setResults([
        {
          stage: 'Test Execution',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setResults([]);
    setExtractedPages([]);
    setExpandedPages(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            PDF Scanning Test Lab
          </h1>
          <p className="text-slate-400">
            Test the new cost-optimized PDF scanning system with local parsing and AI validation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-6">Test Controls</h2>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Upload PDF
                </label>
                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-emerald-500 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-400">
                    {selectedFile ? selectedFile.name : 'Click to select PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Strategy Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Scan Strategy
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setStrategy('fast')}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                      strategy === 'fast'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Fast (Local Only)
                  </button>
                  <button
                    onClick={() => setStrategy('thorough')}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                      strategy === 'thorough'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Thorough (Local + AI)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={runTest}
                  disabled={!selectedFile || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Running...' : 'Run Test'}
                </button>
                <button
                  onClick={reset}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 disabled:opacity-50 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400">
                  <strong>Fast:</strong> Local PDF parsing only (~2s)
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Thorough:</strong> Local + AI validation (~12s)
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-6">Test Results</h2>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">
                    {loading
                      ? 'Running test...'
                      : 'Upload a PDF and click "Run Test" to see results'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-emerald-900 border-emerald-700'
                          : result.status === 'error'
                            ? 'bg-red-900 border-red-700'
                            : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{result.stage}</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              result.status === 'success'
                                ? 'bg-emerald-700 text-emerald-100'
                                : result.status === 'error'
                                  ? 'bg-red-700 text-red-100'
                                  : 'bg-slate-600 text-slate-100'
                            }`}
                          >
                            {result.status.toUpperCase()}
                          </span>
                          {result.duration && (
                            <span className="text-xs text-slate-400">
                              {result.duration.toFixed(2)}ms
                            </span>
                          )}
                        </div>
                      </div>

                      {result.error && (
                        <p className="text-sm text-red-200 font-mono">
                          {result.error}
                        </p>
                      )}

                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-slate-300 cursor-pointer hover:text-slate-200">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-900 rounded text-xs text-slate-300 overflow-auto max-h-64">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}

                  {/* Summary */}
                  {results.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <h4 className="font-semibold text-white mb-3">Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Total Duration</p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {(
                              results.reduce((sum, r) => sum + (r.duration || 0), 0) /
                              1000
                            ).toFixed(2)}
                            s
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Success Rate</p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {(
                              (results.filter((r) => r.status === 'success').length /
                                results.length) *
                              100
                            ).toFixed(0)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Stage 1: PDF Parsing</h3>
              <p className="text-sm text-slate-400">
                Extracts text and structure from PDF using pdf-parse library. Preserves formatting for table detection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Stage 2: Table Detection</h3>
              <p className="text-sm text-slate-400">
                Identifies table structures, column headers, and data rows. Calculates confidence score based on structure quality.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Stage 3: Data Extraction</h3>
              <p className="text-sm text-slate-400">
                Extracts and normalizes data. Calculates totals. If confidence &lt; 60%, uses AI validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
