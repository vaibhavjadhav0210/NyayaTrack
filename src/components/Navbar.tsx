import { Scale } from 'lucide-react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { label: string; page: Page }[] = [
  { label: 'Upload', page: 'upload' },
  { label: 'AI Extraction', page: 'extraction' },
  { label: 'Action Plan', page: 'action-plan' },
  { label: 'Risk Score', page: 'risk-score' },
  { label: 'Dashboard', page: 'dashboard' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <nav className="bg-[#1a237e] border-b border-blue-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left - Brand */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="bg-white/10 rounded-lg p-2">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none tracking-wide">NyayaTrack</div>
            <div className="text-blue-200 text-[10px] tracking-widest uppercase mt-0.5">Government of Karnataka</div>
          </div>
        </div>

        {/* Center - Department */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-white/80 text-xs tracking-widest uppercase font-medium">Department of Law & Justice</span>
        </div>

        {/* Right - Nav tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => onNavigate(tab.page)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                currentPage === tab.page
                  ? 'bg-white text-[#1a237e] shadow'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* System Online */}
          <div className="ml-4 flex items-center gap-2 border-l border-blue-700 pl-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-green-300 text-xs font-medium whitespace-nowrap">System Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
