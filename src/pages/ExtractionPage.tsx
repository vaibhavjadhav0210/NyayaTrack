import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, CreditCard as Edit3, Check, X, FileText } from 'lucide-react';
import { ExtractedField, FieldStatus, VerifiedCaseData } from '../types';
import { formatDisplayDate } from '../utils/dateFormat';

interface ExtractionPageProps {
  filename: string;
  extractedData?: any;
  rawText?: string;
  pdfUrl?: string;
  onSubmit: (verifiedCase: VerifiedCaseData) => void;
}

const INITIAL_FIELDS: ExtractedField[] = [
  { id: '1', label: 'CASE NUMBER', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '2', label: 'COURT NAME', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '3', label: 'DATE OF ORDER', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '4', label: 'RESPONSIBLE DEPARTMENT', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '5', label: 'KEY DIRECTIONS', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '6', label: 'COMPLIANCE DEADLINE', value: 'TBD', confidence: 'LOW', status: 'pending' },
  { id: '7', label: 'NATURE OF ACTION', value: 'N/A', confidence: 'LOW', status: 'pending' },
  { id: '8', label: 'APPEAL LIMITATION PERIOD', value: 'N/A', confidence: 'LOW', status: 'pending' },
];

export default function ExtractionPage({ filename, extractedData, rawText, pdfUrl, onSubmit }: ExtractionPageProps) {
  const displayValue = (value: unknown, fallback = 'N/A') => {
    if (value === null || value === undefined || value === '') return fallback;
    return formatDisplayDate(String(value));
  };

  const initialFields = extractedData ? [
    { id: '1', label: 'CASE NUMBER', value: displayValue(extractedData['Case Number']), confidence: 'HIGH', status: 'pending' },
    { id: '2', label: 'COURT NAME', value: displayValue(extractedData['Court Name']), confidence: 'HIGH', status: 'pending' },
    { id: '3', label: 'DATE OF ORDER', value: displayValue(extractedData['Date of Order']), confidence: 'HIGH', status: 'pending' },
    { id: '4', label: 'RESPONSIBLE DEPARTMENT', value: displayValue(extractedData['Responsible Department']), confidence: 'MEDIUM', status: 'pending' },
    { id: '5', label: 'KEY DIRECTIONS', value: displayValue(extractedData['Verbatim Directions']), confidence: 'MEDIUM', status: 'pending' },
    { id: '6', label: 'COMPLIANCE DEADLINE', value: displayValue(extractedData['Calculated Deadline ISO'] || extractedData['Explicit Timelines']), confidence: 'HIGH', status: 'pending' },
    { id: '7', label: 'NATURE OF ACTION', value: displayValue(extractedData['Recommended Action']), confidence: 'HIGH', status: 'pending' },
    { id: '8', label: 'APPEAL LIMITATION PERIOD', value: displayValue(extractedData['Appeal Limitation Period']), confidence: 'MEDIUM', status: 'pending' },
  ] as ExtractedField[] : INITIAL_FIELDS;

  const riskScore = Number(extractedData?.['Contempt Risk Score'] ?? 0) || 0;

  const [fields, setFields] = useState<ExtractedField[]>(initialFields);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const approvedCount = fields.filter(f => f.status === 'approved').length;
  const allApproved = approvedCount === fields.length;

  const setStatus = (id: string, status: FieldStatus) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const startEdit = (id: string, val: string) => {
    setEditValues(prev => ({ ...prev, [id]: val }));
    setStatus(id, 'editing');
  };

  const saveEdit = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: editValues[id] ?? f.value, status: 'approved' } : f));
  };

  const getFieldValue = (id: string) => fields.find(field => field.id === id)?.value || 'N/A';

  const submitVerifiedFields = () => {
    onSubmit({
      caseNumber: getFieldValue('1'),
      courtName: getFieldValue('2'),
      dateOfOrder: getFieldValue('3'),
      responsibleDepartment: getFieldValue('4'),
      keyDirections: getFieldValue('5'),
      complianceDeadline: getFieldValue('6'),
      natureOfAction: getFieldValue('7'),
      appealLimitationPeriod: getFieldValue('8'),
      riskScore,
    });
  };

  const confidenceStyle = (c: string) => {
    if (c === 'HIGH') return 'bg-green-100 text-green-700 border border-green-200';
    if (c === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    return 'bg-red-100 text-red-700 border border-red-200';
  };

  const cardBg = (status: FieldStatus) => {
    if (status === 'approved') return 'bg-green-50 border-green-300';
    if (status === 'rejected') return 'bg-red-50 border-red-300';
    return 'bg-white border-gray-200';
  };

  const progress = Math.round((approvedCount / fields.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a237e]">Extracted Judgment Fields</h1>
            <p className="text-gray-500 text-sm mt-1">
              <span className="font-medium text-gray-700">{filename}</span> · Review and verify each extracted field
            </p>
          </div>

          {/* Circular progress */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={allApproved ? '#16a34a' : '#1a237e'}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1a237e]">{approvedCount}/{fields.length}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">Fields Verified</span>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Viewer */}
          <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white h-fit sticky top-24">
            <div className="bg-[#1a237e] px-4 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-200" />
              <span className="text-white text-sm font-medium truncate">{filename}</span>
            </div>
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-[75vh] border-none" title="PDF Document" />
            ) : (
              <>
                <div className="p-6 font-mono text-xs text-gray-700 leading-relaxed bg-white max-h-[70vh] overflow-y-auto whitespace-pre-wrap">
                  {rawText || 'No extracted document text available. Upload and analyse a judgment to review source text here.'}
                </div>
                <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
                  <p className="text-yellow-700 text-xs">Yellow highlights indicate AI-extracted fields</p>
                </div>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className={`rounded-xl border p-4 transition-all duration-300 ${cardBg(field.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{field.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${confidenceStyle(field.confidence)}`}>
                    {field.confidence}
                  </span>
                </div>

                {field.status === 'editing' ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={editValues[field.id] ?? field.value}
                      onChange={e => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(field.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStatus(field.id, 'pending')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 font-semibold text-sm mt-1 leading-snug">{field.value}</p>
                )}

                {field.status !== 'editing' && (
                  <div className="flex gap-2 mt-3">
                    {field.status === 'approved' ? (
                      <button
                        onClick={() => setStatus(field.id, 'pending')}
                        className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors hover:bg-green-600"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </button>
                    ) : field.status === 'rejected' ? (
                      <button
                        onClick={() => setStatus(field.id, 'pending')}
                        className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors hover:bg-red-600"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setStatus(field.id, 'approved')}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => startEdit(field.id, field.value)}
                          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setStatus(field.id, 'rejected')}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <AlertCircle className="w-5 h-5 text-[#1a237e]" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase">Calculated Automatically</p>
                <p className="text-[#1a237e] font-bold text-base">AI-Computed Risk Score: {riskScore}/100</p>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submitVerifiedFields}
              disabled={!allApproved}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 mt-2 ${
                allApproved
                  ? 'bg-[#1a237e] hover:bg-blue-800 text-white shadow-lg hover:shadow-blue-200 hover:shadow-xl cursor-pointer active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allApproved ? 'Submit Verified Fields' : `Approve all fields to continue (${approvedCount}/${fields.length} approved)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
