import { useState } from 'react';
import { LayoutGrid, AlertTriangle, Clock, CheckCircle, Filter, Eye } from 'lucide-react';
import { CaseRow } from '../types';
import { formatDisplayDate } from '../utils/dateFormat';

interface DashboardPageProps {
  processedCases: CaseRow[];
  onViewCase: () => void;
}

type FilterType = 'All Cases' | 'High Risk' | 'Critical' | 'Pending' | 'Completed';

function RiskBadge({ score }: { score: number }) {
  if (score >= 85) return (
    <span className="inline-flex items-center gap-1 bg-red-900 text-red-100 text-xs font-bold px-2.5 py-1 rounded-full">
      {score} CRITICAL
    </span>
  );
  if (score >= 71) return (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold px-2.5 py-1 rounded-full">
      {score} HIGH
    </span>
  );
  if (score >= 41) return (
    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold px-2.5 py-1 rounded-full">
      {score} MEDIUM
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
      {score} LOW
    </span>
  );
}

function StatusBadge({ status }: { status: CaseRow['status'] }) {
  const styles: Record<CaseRow['status'], string> = {
    Pending: 'bg-gray-100 text-gray-700 border border-gray-200',
    Verified: 'bg-blue-100 text-blue-700 border border-blue-200',
    Completed: 'bg-green-100 text-green-700 border border-green-200',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>{status}</span>
  );
}

export default function DashboardPage({ processedCases, onViewCase }: DashboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All Cases');

  const displayCases = processedCases;

  const filtered = displayCases.filter(c => {
    if (activeFilter === 'All Cases') return true;
    if (activeFilter === 'High Risk') return c.riskScore >= 71 && c.riskScore < 85;
    if (activeFilter === 'Critical') return c.riskScore >= 85;
    if (activeFilter === 'Pending') return c.status === 'Pending';
    if (activeFilter === 'Completed') return c.status === 'Completed';
    return true;
  });

  const filters: FilterType[] = ['All Cases', 'High Risk', 'Critical', 'Pending', 'Completed'];

  const summaryCards = [
    { icon: LayoutGrid, label: 'Total Cases', value: displayCases.length, color: 'text-[#1a237e]', bg: 'bg-blue-50 border-blue-100' },
    { icon: AlertTriangle, label: 'High Risk Cases', value: displayCases.filter(c => c.riskScore >= 71).length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    { icon: Clock, label: 'Due This Week', value: 0, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    { icon: CheckCircle, label: 'Completed', value: displayCases.filter(c => c.status === 'Completed').length, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="w-5 h-5 text-[#1a237e]" />
              <h1 className="text-2xl font-bold text-[#1a237e]">Judgment Compliance Dashboard</h1>
            </div>
            <p className="text-gray-500 text-sm">Government of Karnataka · Department of Law & Justice</p>
          </div>
          <span className="text-xs text-gray-400 font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
            Last updated: Today, 09:42 AM IST
          </span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4 ${card.bg}`}>
                <div className={`rounded-xl p-3 bg-white/60 border ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
                  <p className="text-gray-600 text-xs font-medium">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-[#1a237e] font-bold text-base">Case Registry</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    activeFilter === f
                      ? 'bg-[#1a237e] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['CASE ID', 'COURT', 'DEPARTMENT', 'DEADLINE', 'CONTEMPT RISK SCORE', 'STATUS', 'ACTION'].map(col => (
                    <th key={col} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[#1a237e] font-semibold text-sm">{row.caseId}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm max-w-[160px] truncate">{row.court}</td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm max-w-[180px] truncate">{row.department}</td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm whitespace-nowrap">{formatDisplayDate(row.deadline)}</td>
                    <td className="px-4 py-3.5">
                      <RiskBadge score={row.riskScore} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={onViewCase}
                        className="flex items-center gap-1.5 bg-[#1a237e] hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {displayCases.length === 0
                    ? 'No cases processed yet. Upload a judgment to get started.'
                    : 'No cases match the selected filter.'}
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {displayCases.length} cases</p>
          </div>
        </div>
      </div>
    </div>
  );
}
