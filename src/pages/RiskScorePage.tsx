import { ChevronRight, AlertTriangle, Clock, History, RefreshCw, AlertCircle } from 'lucide-react';
import { VerifiedCaseData } from '../types';
import { formatDisplayDate } from '../utils/dateFormat';

interface RiskScorePageProps {
  verifiedCase: VerifiedCaseData | null;
  onDashboard: () => void;
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

function getDaysLeft(deadline: string) {
  const deadlineDate = parseCaseDate(deadline);
  if (!deadlineDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000);
}

function getDaysLeftText(daysLeft: number | null) {
  if (daysLeft === null) return 'TBD';
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day';
  return `${daysLeft} days`;
}

function getRiskDisplay(score: number) {
  if (score > 84) {
    return {
      label: 'CRITICAL',
      badgeClass: 'bg-red-900 text-red-100',
      textClass: 'text-red-700',
      alertClass: 'bg-red-900',
      gaugeColor: '#991b1b',
    };
  }
  if (score > 70) {
    return {
      label: 'HIGH RISK',
      badgeClass: 'bg-red-100 text-red-700 border border-red-200',
      textClass: 'text-red-600',
      alertClass: 'bg-red-600',
      gaugeColor: '#ef4444',
    };
  }
  if (score > 40) {
    return {
      label: 'MEDIUM',
      badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      textClass: 'text-yellow-600',
      alertClass: 'bg-yellow-500',
      gaugeColor: '#f59e0b',
    };
  }
  return {
    label: 'LOW',
    badgeClass: 'bg-green-100 text-green-800 border border-green-200',
    textClass: 'text-green-600',
    alertClass: 'bg-green-600',
    gaugeColor: '#22c55e',
  };
}

function GaugeChart({ score, scoreColor }: { score: number; scoreColor: string }) {
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const startAngle = 180;
  const totalAngle = 180;
  const scoreAngle = startAngle - (score / 100) * totalAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  const arcPath = (startA: number, endA: number, color: string, strokeWidth = 16) => {
    const s = polarToCartesian(startA);
    const e = polarToCartesian(endA);
    const largeArc = Math.abs(startA - endA) > 180 ? 1 : 0;
    return (
      <path
        d={`M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 0 ${e.x} ${e.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  };

  const needle = polarToCartesian(scoreAngle);

  return (
    <svg viewBox="0 0 220 130" className="w-full max-w-xs mx-auto">
      {arcPath(180, 0, '#e5e7eb', 16)}
      {arcPath(180, 108, '#22c55e', 14)}
      {arcPath(108, 54, '#f59e0b', 14)}
      {arcPath(54, 0, '#ef4444', 14)}
      <line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke="#1a237e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="6" fill="#1a237e" />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="28" fontWeight="bold" fill={scoreColor}>{score}</text>
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
    </svg>
  );
}

interface RiskFactor {
  icon: React.ElementType;
  label: string;
  score: number;
  description: string;
}

function FactorBar({ factor }: { factor: RiskFactor }) {
  const color = factor.score >= 71 ? 'bg-red-500' : factor.score >= 41 ? 'bg-yellow-400' : 'bg-green-500';
  const Icon = factor.icon;
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{factor.label}</span>
        </div>
        <span className={`text-sm font-bold ${factor.score >= 71 ? 'text-red-600' : factor.score >= 41 ? 'text-yellow-600' : 'text-green-600'}`}>
          {factor.score}/100
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${factor.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{factor.description}</p>
    </div>
  );
}

export default function RiskScorePage({ verifiedCase, onDashboard }: RiskScorePageProps) {
  const score = verifiedCase?.riskScore ?? 0;
  const risk = getRiskDisplay(score);
  const caseNumber = verifiedCase?.caseNumber || 'N/A';
  const courtName = verifiedCase?.courtName || 'N/A';
  const dateOfOrder = formatDisplayDate(verifiedCase?.dateOfOrder || 'N/A');
  const keyDirections = verifiedCase?.keyDirections || 'N/A';
  const responsibleDepartment = verifiedCase?.responsibleDepartment || 'N/A';
  const complianceDeadline = verifiedCase?.complianceDeadline || 'TBD';
  const displayDeadline = formatDisplayDate(complianceDeadline);
  const natureOfAction = verifiedCase?.natureOfAction || 'N/A';
  const actionLabel = natureOfAction.toUpperCase();
  const appealLimitationPeriod = verifiedCase?.appealLimitationPeriod || 'N/A';
  const daysLeft = getDaysLeft(complianceDeadline);
  const daysLeftText = getDaysLeftText(daysLeft);
  const proximityScore = daysLeft === null ? 0 : daysLeft < 10 ? 85 : daysLeft < 30 ? 60 : daysLeft < 60 ? 40 : 20;
  const severityScore = score;
  const departmentHistoryScore = Math.max(0, Math.min(100, score - 8));
  const extensionScore = Math.max(0, Math.min(100, Math.round(score * 0.75)));

  const factors: RiskFactor[] = [
    {
      icon: Clock,
      label: 'Deadline Proximity',
      score: proximityScore,
      description: daysLeft === null ? 'Deadline could not be parsed from verified fields' : `${daysLeftText} until the verified compliance deadline`,
    },
    {
      icon: History,
      label: 'Department Compliance History',
      score: departmentHistoryScore,
      description: `${responsibleDepartment} should review prior compliance history for this matter`,
    },
    {
      icon: AlertCircle,
      label: 'Judgment Severity',
      score: severityScore,
      description: `AI-computed severity based on the verified judgment fields is ${score}/100`,
    },
    {
      icon: RefreshCw,
      label: 'Prior Extensions',
      score: extensionScore,
      description: 'No verified extension data was extracted from the judgment fields',
    },
  ];

  const actions = [
    {
      num: '01',
      title: 'Issue Internal Circular',
      description: `${responsibleDepartment} should circulate the verified direction: ${keyDirections}`,
    },
    {
      num: '02',
      title: 'Form Task Force',
      description: `Assign officers to complete ${actionLabel} before ${displayDeadline}`,
    },
    {
      num: '03',
      title: 'File Status Report',
      description: `Prepare a court-ready status update for ${caseNumber} with appeal limitation noted as ${appealLimitationPeriod}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a237e]">Contempt Risk Assessment</h1>
            <p className="text-gray-500 text-sm mt-1">Case: {caseNumber} - AI-Computed Risk Analysis</p>
          </div>
          <button
            onClick={onDashboard}
            className="flex items-center gap-2 border border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {score > 70 && (
          <div className={`${risk.alertClass} rounded-xl p-4 mb-6 flex items-start gap-3 shadow`}>
            <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-bold text-base">{risk.label} CONTEMPT RISK - Immediate Action Required</p>
              <p className="text-red-100 text-sm mt-1">
                This case has a risk score of {score}/100. {responsibleDepartment} must act promptly to avoid contempt exposure.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-[#1a237e] font-bold text-base mb-4 text-center">Contempt Risk Score</h3>
            <GaugeChart score={score} scoreColor={risk.gaugeColor} />

            <div className="flex justify-center mb-4">
              <span className={`${risk.badgeClass} font-bold text-sm px-4 py-1.5 rounded-full`}>
                {risk.label}
              </span>
            </div>

            <div className="flex justify-center gap-4 mb-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />0-40 Low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />41-70 Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />71-100 High</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">CASE</span>
                <span className="text-gray-800 font-semibold">{caseNumber}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500 font-medium">COURT</span>
                <span className="text-gray-800 font-semibold text-right">{courtName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">ORDER DATE</span>
                <span className="text-gray-800 font-semibold">{dateOfOrder}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">DEPARTMENT</span>
                <span className="text-gray-800 font-semibold text-right">{responsibleDepartment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">ACTION</span>
                <span className="text-gray-800 font-semibold">{actionLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">DEADLINE</span>
                <span className="text-gray-800 font-semibold">{displayDeadline}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500 font-medium">APPEAL LIMIT</span>
                <span className="text-gray-800 font-semibold text-right">{appealLimitationPeriod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">DAYS LEFT</span>
                <span className={`${risk.textClass} font-bold`}>{daysLeftText}</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">Updated daily at 6:00 AM IST</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-[#1a237e] font-bold text-base mb-5">Risk Factor Breakdown</h3>
            {factors.map(f => <FactorBar key={f.label} factor={f} />)}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800 font-bold text-base">Recommended Immediate Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map(a => (
              <div key={a.num} className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-red-200 mb-2">{a.num}</div>
                <p className="text-red-800 font-bold text-sm mb-2">{a.title}</p>
                <p className="text-red-700 text-xs leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onDashboard}
          className="w-full bg-[#1a237e] hover:bg-blue-800 text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200/50 active:scale-[0.99]"
        >
          Go to Dashboard <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
