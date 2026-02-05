'use client';

import { MapPin, Lightning, ChartBar, CurrencyDollar } from '@phosphor-icons/react';
import type { SummaryData } from '@/types';

interface SummaryGridProps {
  summaryData: SummaryData[];
  confidence: number;
  totalTokens: number;
  estimatedCost: number;
}

export default function SummaryGrid({ summaryData, confidence, totalTokens, estimatedCost }: SummaryGridProps) {
  if (!summaryData || summaryData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MapPin weight="regular" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No irrigation associations found</p>
        <p className="text-sm">Try scanning different pages or check the PDF content</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Irrigation Associations ({summaryData.length})
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded">
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              {confidence}%
            </span>
            <span className="text-xs text-emerald-600">Confidence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map((association, index) => (
          <div
            key={association.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center flex-shrink-0">
                <MapPin weight="regular" className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {association.name}
                </h4>
                <p className="text-xs text-gray-500">Association #{index + 1}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Area</span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {association.totalArea.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Confidence</span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {association.confidence}%
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                  <Lightning weight="fill" className="w-3 h-3 text-emerald-600 mb-1" />
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    {(association.usage / 1000).toFixed(1)}K
                  </span>
                  <span className="text-xs text-emerald-600">Tokens</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                  <ChartBar weight="fill" className="w-3 h-3 text-emerald-600 mb-1" />
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    {association.confidence}%
                  </span>
                  <span className="text-xs text-emerald-600">Score</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                  <CurrencyDollar weight="fill" className="w-3 h-3 text-emerald-600 mb-1" />
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    ₱{((estimatedCost / summaryData.length) * 58).toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-600">Cost</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Summary Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">
              {summaryData.length}
            </div>
            <div className="text-xs text-gray-600">Associations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">
              {summaryData.reduce((sum, assoc) => sum + assoc.totalArea, 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Total Area</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">
              {confidence}%
            </div>
            <div className="text-xs text-gray-600">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">
              ₱{(estimatedCost * 58).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Total Cost</div>
          </div>
        </div>
      </div>
    </div>
  );
}