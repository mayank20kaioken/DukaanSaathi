import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Info, 
  Building2, 
  PhoneCall 
} from 'lucide-react';

export const OfficerIdScannerView: React.FC = () => {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [selectedPreset, setSelectedPreset] = useState<'fssai' | 'gst'>('fssai');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  const sampleOfficerCards = {
    fssai: {
      title: 'Food Safety Officer (FSSAI) Inspection ID',
      officerName: 'Inspector Sandeep Verma',
      designation: 'Food Safety Officer (Grade II)',
      department: 'Department of Food Safety, Govt. of NCT of Delhi',
      badgeId: 'FSSAI-DL-2024-9148',
      jurisdiction: 'District Central / Chandni Chowk Zone',
      validity: 'Valid up to 31-Dec-2027',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80'
    },
    gst: {
      title: 'State GST Enforcement Badge',
      officerName: 'Vipin Kumar Saxena',
      designation: 'State Tax Officer (Enforcement)',
      department: 'Department of Trade and Taxes, Govt. of NCT of Delhi',
      badgeId: 'GST-ENF-DEL-4410',
      jurisdiction: 'Ward 24, Zone 1',
      validity: 'Valid up to 30-Nov-2026',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80'
    }
  };

  const card = sampleOfficerCards[selectedPreset];

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 800);
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {isHi ? 'एआई अधिकारी आईडी स्कैनर एवं सत्यापन' : 'AI Officer ID Scanner & Verification'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Shopkeeper Protection
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Digitally log and parse credentials presented by visiting inspection officers (FSSAI, GST, Weights & Measures).
          </p>
        </div>
      </div>

      {/* CRITICAL VERIFICATION CAVEAT BANNER (Prompt Requirement) */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Status: Unable to Certify Legal Authenticity (OCR Extraction Only)</span>
        </div>
        <p>
          <strong>Notice to Retailer:</strong> DukaanSaathi uses optical character recognition (OCR) to extract names, designations, and badge numbers from presented cards. <em>Only report successful verification if an authorised, authoritative verification source (such as DigiLocker National Registry or official departmental SSO gateway) is actually integrated.</em> Without an active government backend connection, this system displays <strong>"Unable to Verify"</strong> and cannot confirm that an officer's badge is authentic.
        </p>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Capture / Preset Selector */}
        <div className="lg:col-span-5 rounded-3xl bg-navy-800/95 border border-slate-700 p-5 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">ID Card Capture</h3>
            <span className="text-[10px] text-slate-400">High-Security Mode</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedPreset('fssai'); handleSimulateScan(); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedPreset === 'fssai' 
                  ? 'bg-lime-accent text-navy-950 shadow-lime-glow' 
                  : 'bg-navy-900 text-slate-300 border border-slate-800'
              }`}
            >
              FSSAI Food Officer ID
            </button>
            <button
              onClick={() => { setSelectedPreset('gst'); handleSimulateScan(); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedPreset === 'gst' 
                  ? 'bg-lime-accent text-navy-950 shadow-lime-glow' 
                  : 'bg-navy-900 text-slate-300 border border-slate-800'
              }`}
            >
              State GST Inspector ID
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-navy-950 aspect-[4/3] flex items-center justify-center">
            <img
              src={card.imageUrl}
              alt="Officer ID Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent flex items-end p-4">
              <span className="text-[10px] font-mono text-lime-accent bg-black/80 px-2.5 py-1 rounded-lg">
                Extracted: {card.badgeId}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="flex-1 py-2.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-lime-accent border border-lime-accent/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Scanning Card...' : 'Scan New Badge'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Extracted Fields & Safety Protocol */}
        <div className="lg:col-span-7 rounded-3xl bg-navy-800/95 border border-slate-700 p-6 shadow-card-dark space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white">Extracted Credential Details</h3>
              <p className="text-[10px] text-slate-400">OCR parsing from submitted identity card</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              UNABLE TO VERIFY AUTHENTICITY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Officer Name</span>
              <p className="font-bold text-white text-sm mt-0.5">{card.officerName}</p>
            </div>

            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Designation</span>
              <p className="font-bold text-lime-accent text-sm mt-0.5">{card.designation}</p>
            </div>

            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department / Agency</span>
              <p className="font-semibold text-slate-200 mt-0.5">{card.department}</p>
            </div>

            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Badge / License ID</span>
              <p className="font-extrabold text-white text-sm font-mono mt-0.5">{card.badgeId}</p>
            </div>

            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Jurisdiction Zone</span>
              <p className="text-slate-300 mt-0.5">{card.jurisdiction}</p>
            </div>

            <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Document Validity</span>
              <p className="text-slate-300 mt-0.5 font-mono">{card.validity}</p>
            </div>
          </div>

          {/* Shopkeeper Legal Safety Checklist */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
              🛡️ Retailer Rights & Legal Protocol During Inspection
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li>Always politely ask for the written official Inspection Notice (Section 38 under FSSAI / Section 67 under CGST Act).</li>
              <li>Inspectors must carry a physical signed panchnama witness when seizing samples or records.</li>
              <li><strong>Never pay on-the-spot cash fines to any visiting officer.</strong> All compounding fees or penalties must be paid online via official government portals (FOSCOS or GST.gov.in) with valid treasury challan receipts.</li>
              <li>You have the legal right to take a photograph of their official badge for your store compliance log.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
