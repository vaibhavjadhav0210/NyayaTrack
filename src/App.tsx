import { useState } from 'react';
import { CaseRow, Page, VerifiedCaseData } from './types';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import ExtractionPage from './pages/ExtractionPage';
import ActionPlanPage from './pages/ActionPlanPage';
import RiskScorePage from './pages/RiskScorePage';
import DashboardPage from './pages/DashboardPage';
import { formatDisplayDate } from './utils/dateFormat';

export default function App() {
  const [page, setPage] = useState<Page>('upload');
  const [filename, setFilename] = useState('No file selected');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [verifiedCase, setVerifiedCase] = useState<VerifiedCaseData | null>(null);
  const [processedCases, setProcessedCases] = useState<CaseRow[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  const navigate = (target: Page) => {
    if (target === page) return;
    setTransitioning(true);
    setTimeout(() => {
      setPage(target);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  };

  const handleAnalyse = (name: string, data: any, raw: string, url: string) => {
    setFilename(name);
    setExtractedData(data);
    setRawText(raw);
    setPdfUrl(url);
    navigate('extraction');
  };

  const handleVerifiedSubmit = (caseData: VerifiedCaseData) => {
    setVerifiedCase(caseData);

    const caseRow: CaseRow = {
      id: `${Date.now()}`,
      caseId: caseData.caseNumber || filename,
      court: caseData.courtName || 'Unknown Court',
      department: caseData.responsibleDepartment || 'Unknown',
      deadline: formatDisplayDate(caseData.complianceDeadline || 'TBD'),
      riskScore: caseData.riskScore,
      status: 'Verified',
    };

    setProcessedCases(prev => [caseRow, ...prev]);
    navigate('action-plan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={page} onNavigate={navigate} />
      <div className={`transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {page === 'upload' && (
          <UploadPage onAnalyse={handleAnalyse} />
        )}
        {page === 'extraction' && (
          <ExtractionPage filename={filename} extractedData={extractedData} rawText={rawText} pdfUrl={pdfUrl} onSubmit={handleVerifiedSubmit} />
        )}
        {page === 'action-plan' && (
          <ActionPlanPage verifiedCase={verifiedCase} onViewRisk={() => navigate('risk-score')} />
        )}
        {page === 'risk-score' && (
          <RiskScorePage verifiedCase={verifiedCase} onDashboard={() => navigate('dashboard')} />
        )}
        {page === 'dashboard' && (
          <DashboardPage processedCases={processedCases} onViewCase={() => navigate('extraction')} />
        )}
      </div>
    </div>
  );
}
