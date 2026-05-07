import { useState } from 'react';
import { ChevronRight, CheckCircle, XCircle, Clock, Lightbulb, AlertCircle, Home, Download } from 'lucide-react';
import { VerifiedCaseData } from '../types';
import { formatDisplayDate } from '../utils/dateFormat';

interface ActionPlanPageProps {
  verifiedCase: VerifiedCaseData | null;
  onViewRisk: () => void;
}

function parseCaseDate(value: string) {
  if (!value || value === 'N/A' || value === 'TBD') return null;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDaysLeftText(deadline: string) {
  const deadlineDate = parseCaseDate(deadline);
  if (!deadlineDate) return 'Deadline status unavailable';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day remaining until deadline';
  return `${daysLeft} days remaining until deadline`;
}

function getRiskLabel(score: number) {
  if (score > 84) return 'CRITICAL';
  if (score > 70) return 'HIGH RISK';
  if (score > 40) return 'MEDIUM';
  return 'LOW';
}

export default function ActionPlanPage({ verifiedCase, onViewRisk }: ActionPlanPageProps) {
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const caseNumber = verifiedCase?.caseNumber || 'N/A';
  const courtName = verifiedCase?.courtName || 'N/A';
  const dateOfOrder = formatDisplayDate(verifiedCase?.dateOfOrder || 'N/A');
  const keyDirections = verifiedCase?.keyDirections || 'N/A';
  const responsibleDepartment = verifiedCase?.responsibleDepartment || 'N/A';
  const complianceDeadline = formatDisplayDate(verifiedCase?.complianceDeadline || 'TBD');
  const natureOfAction = verifiedCase?.natureOfAction || 'N/A';
  const actionLabel = natureOfAction.toUpperCase();
  const isAppeal = actionLabel === 'APPEAL';
  const appealLimitationPeriod = verifiedCase?.appealLimitationPeriod || 'N/A';
  const daysLeftText = getDaysLeftText(verifiedCase?.complianceDeadline || '');
  const riskScore = verifiedCase?.riskScore ?? 0;
  const riskLabel = getRiskLabel(riskScore);
  const generatedAtText = generatedAt.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const recommendationText = `Based on the verified judgment fields, ${responsibleDepartment} should proceed with the selected action: ${actionLabel}. The operative direction is: ${keyDirections}`;

  const handleDownloadReport = () => {
    setGeneratedAt(new Date());
    window.setTimeout(() => window.print(), 0);
  };

  const comply = [
    'Avoids contempt of court proceedings',
    'Supports timely execution of court directions',
    'Reduces additional litigation and administrative cost',
    'Creates a clear compliance record for the department',
    'Aligns action with the verified judgment directions',
  ];

  const appeal = [
    'Requires legal review before limitation expires',
    'May extend litigation and delay compliance',
    'Should be weighed against the clarity of the court directions',
    'Needs department-level approval and documented grounds',
    'Does not remove contempt exposure if no stay is granted',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Home className="w-3.5 h-3.5" />
          <span>NyayaTrack</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1a237e] font-medium">Action Plan</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a237e]">Generated Action Plan</h1>
            <p className="text-gray-500 text-sm mt-1">Case: {caseNumber} - {courtName}</p>
          </div>
          <div className="flex items-center gap-3 print-hidden">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-[#1a237e] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={onViewRisk}
              className="flex items-center gap-2 bg-[#1a237e] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow"
            >
              View Risk Score <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#1a237e] px-6 py-3">
              <span className="text-white font-semibold text-sm tracking-wide">CASE SUMMARY</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 pb-5 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Case Number</p>
                  <p className="text-gray-900 font-semibold text-sm">{caseNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Court</p>
                  <p className="text-gray-900 font-semibold text-sm">{courtName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Date of Order</p>
                  <p className="text-gray-900 font-semibold text-sm">{dateOfOrder}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Key Directions</p>
                <p className="text-gray-700 text-sm leading-relaxed">{keyDirections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-xl p-3">
                  <CheckCircle className="w-7 h-7 text-[#1a237e]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Action Required</p>
                  <p className="text-3xl font-extrabold text-[#1a237e]">{actionLabel}</p>
                </div>
              </div>
              <span className="bg-blue-100 text-[#1a237e] border border-blue-200 font-semibold text-sm px-4 py-1.5 rounded-full">
                {isAppeal ? 'Appeal Review' : 'Compliance Order'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Responsible Authority</p>
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Department</p>
                <p className="text-gray-900 font-semibold text-sm mt-0.5">{responsibleDepartment}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Deadline & Timeline</p>
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">Compliance Deadline</p>
                <p className="text-3xl font-extrabold text-gray-900">{complianceDeadline}</p>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                <span className="text-yellow-700 text-sm font-semibold">{daysLeftText}</span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">Appeal Limitation Period</p>
                <p className="text-gray-700 text-sm font-medium">{appealLimitationPeriod}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a237e] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 rounded-lg p-2">
                <Lightbulb className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-white font-semibold text-base">AI Recommendation</span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">{recommendationText}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-[#1a237e] font-bold text-base mb-5">Comply vs Appeal Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border-2 border-green-300 rounded-xl p-5 bg-green-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-800 font-bold text-base">Comply</span>
                  <span className="bg-green-100 text-green-700 border border-green-300 text-xs font-bold px-3 py-1 rounded-full">
                    {isAppeal ? 'CONSIDER' : 'RECOMMENDED'}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {comply.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-green-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-2 border-red-300 rounded-xl p-5 bg-red-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-red-800 font-bold text-base">Appeal</span>
                  <span className="bg-red-100 text-red-700 border border-red-300 text-xs font-bold px-3 py-1 rounded-full">
                    {isAppeal ? 'RECOMMENDED' : 'NOT ADVISED'}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {appeal.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-red-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={onViewRisk}
            className="w-full bg-[#1a237e] hover:bg-blue-800 text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200/50 active:scale-[0.99]"
          >
            <AlertCircle className="w-5 h-5" />
            View Contempt Risk Score <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <article className="print-report" aria-hidden="true">
        <header className="print-report__header">
          <h1>NyayaTrack - Court Judgment Intelligence System</h1>
          <p>Government of Karnataka - Department of Law & Justice</p>
          <h2>OFFICIAL COMPLIANCE REPORT - CONFIDENTIAL</h2>
          <p>Generated: {generatedAtText}</p>
        </header>

        <section className="print-report__section">
          <h3>Section 1 - Case Details</h3>
          <dl className="print-report__grid">
            <div>
              <dt>Case Number</dt>
              <dd>{caseNumber}</dd>
            </div>
            <div>
              <dt>Court Name</dt>
              <dd>{courtName}</dd>
            </div>
            <div>
              <dt>Date of Order</dt>
              <dd>{dateOfOrder}</dd>
            </div>
            <div>
              <dt>Responsible Department</dt>
              <dd>{responsibleDepartment}</dd>
            </div>
          </dl>
          <div className="print-report__text-block">
            <h4>Key Directions</h4>
            <p>{keyDirections}</p>
          </div>
        </section>

        <section className="print-report__section">
          <h3>Section 2 - Required Action</h3>
          <dl className="print-report__grid">
            <div>
              <dt>Nature of Action</dt>
              <dd>{actionLabel}</dd>
            </div>
            <div>
              <dt>Compliance Deadline</dt>
              <dd>{complianceDeadline}</dd>
            </div>
            <div>
              <dt>Appeal Limitation Period</dt>
              <dd>{appealLimitationPeriod}</dd>
            </div>
            <div>
              <dt>Days Remaining</dt>
              <dd>{daysLeftText}</dd>
            </div>
          </dl>
        </section>

        <section className="print-report__section">
          <h3>Section 3 - AI Recommendation</h3>
          <p>{recommendationText}</p>
        </section>

        <section className="print-report__section">
          <h3>Section 4 - Risk Assessment</h3>
          <p>
            Contempt Risk Score: <strong>{riskScore}/100 - {riskLabel}</strong>
          </p>
          <ul className="print-report__list">
            <li>Deadline status: {daysLeftText}</li>
            <li>Responsible department: {responsibleDepartment}</li>
            <li>Recommended action: {actionLabel}</li>
            <li>Risk classification: {riskLabel}</li>
          </ul>
        </section>

        <section className="print-report__section">
          <h3>Section 5 - Verification Record</h3>
          <ul className="print-report__list">
            <li>This action plan was verified by a human officer</li>
            <li>Generated by NyayaTrack AI System</li>
            <li>Powered by Government of Karnataka e-Governance</li>
          </ul>
        </section>

        <footer className="print-report__footer">
          <p>This document is auto-generated by NyayaTrack</p>
          <p>For official use only</p>
        </footer>
      </article>
    </div>
  );
}
