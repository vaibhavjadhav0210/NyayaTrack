import React, { useRef, useState } from 'react';
import { Scale, Upload, CheckCircle, Brain, ClipboardCheck, AlertTriangle, Share2, Shield } from 'lucide-react';

interface UploadPageProps {
  onAnalyse: (filename: string, extractedData: any, rawText: string, pdfUrl: string) => void;
}

export default function UploadPage({ onAnalyse }: UploadPageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setUploadedFile(file);
    }
  };

  const handleAnalyseClick = async () => {
    if (!uploadedFile) {
      alert('Please upload a PDF file first.');
      return;
    }
    
    const file = uploadedFile;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch("https://nyayatrack-api.onrender.com/api/process-judgment", {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to process file on the server.');
      }
      
      const data = await response.json();
      const pdfUrl = URL.createObjectURL(file);
      onAnalyse(file.name, data.extracted_data, data.raw_text, pdfUrl);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const features = [
    { icon: Brain, label: 'AI Extraction' },
    { icon: ClipboardCheck, label: 'Verified Action Planning' },
    { icon: AlertTriangle, label: 'Contempt Risk Scoring' },
    { icon: Share2, label: 'Department Routing' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1b5e] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a237e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/20 shadow-xl backdrop-blur-sm">
          <Scale className="w-14 h-14 text-white" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-white tracking-tight leading-none">NyayaTrack</h1>
          <p className="text-blue-200 text-xl mt-3 font-medium tracking-wide">Court Judgment Intelligence System</p>
          <p className="text-blue-300/70 text-sm mt-2">AI-Powered Verified Action Planning for Karnataka Government</p>
        </div>

        {/* Classified badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-5 py-2 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-white/80 text-xs tracking-widest font-semibold uppercase">Secure · Classified · Official Use Only</span>
        </div>

        {/* Upload box */}
        <div
          className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 ${
            dragging ? 'border-blue-300 bg-white/10' : uploadedFile ? 'border-green-400/60 bg-green-500/5' : 'border-blue-400/40 bg-white/5 hover:border-blue-300 hover:bg-white/8'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />

          {uploadedFile ? (
            <>
              <div className="bg-green-500/20 rounded-full p-4 border border-green-400/40">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-green-300 font-semibold text-lg">{uploadedFile.name}</p>
                <p className="text-green-400/70 text-sm mt-1">File ready for analysis</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/10 rounded-full p-4 border border-white/20">
                <Upload className="w-10 h-10 text-blue-200" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-medium">Drag & drop your PDF here</p>
                <p className="text-blue-300 text-sm mt-1">or browse to upload</p>
              </div>
              <p className="text-blue-400/60 text-xs text-center">
                High Court Orders · District Court Judgments · Tribunal Orders
              </p>
            </>
          )}
        </div>

        {/* Analyse button */}
        <button
          onClick={handleAnalyseClick}
          disabled={isUploading || !uploadedFile}
          className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:shadow-xl active:scale-[0.98] ${
            (isUploading || !uploadedFile) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Analyzing with AI...' : 'Analyse Judgment'}
        </button>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-4 py-2 text-blue-200 text-sm"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
