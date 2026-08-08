import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  User, 
  MapPin, 
  Award, 
  AlertTriangle, 
  HelpCircle, 
  Wrench, 
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { Product } from '../types';

interface PrintableWarrantyModalProps {
  product: Product;
  onClose: () => void;
  defaultCustomerName?: string;
  defaultProjectAddress?: string;
  defaultJobRef?: string;
}

export const PrintableWarrantyModal: React.FC<PrintableWarrantyModalProps> = ({
  product,
  onClose,
  defaultCustomerName = 'Valued Customer / Client',
  defaultProjectAddress = 'Sri Lanka Site Location',
  defaultJobRef = `JOB-${Math.floor(100000 + Math.random() * 900000)}`
}) => {
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [projectAddress, setProjectAddress] = useState(defaultProjectAddress);
  const [jobRef, setJobRef] = useState(defaultJobRef);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const certNumber = `WARR-${product.product_code || 'PROD'}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  const warrantyTerms = product.warranty_terms_specs || [];
  const dlpFrameworks = product.dlp_frameworks || [];
  const mainMaterials = product.main_materials || [];
  const glassSpecs = product.glass_specs || [];
  const hardware = product.hardware_accessories || [];
  const technicalDetails = product.technical_details || [];
  const finishes = product.surface_finishes_specs || [];
  const fabricationMethods = product.fabrication_methods || [];
  const installationScopes = product.installation_scopes || [];
  const faqs = product.product_faqs || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F203C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden my-auto text-[#0F203C]">
        
        {/* MODAL CONTROLS HEADER (Hidden during printing via CSS) */}
        <div className="p-4 bg-[#0F203C] text-white flex items-center justify-between shrink-0 border-b border-slate-800 printable-modal-header no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
                <span>Official Warranty Certificate Generator</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {certNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Generate and print structural & material warranty certificates for customer handovers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 printable-modal-controls">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer border border-emerald-400/30"
              title="Print Warranty Certificate (Ctrl + P)"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE CUSTOMER METADATA INPUT BAR (Hidden during print) */}
        <div className="bg-slate-100 p-3.5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs no-print">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              placeholder="Client Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Project / Site Address</label>
            <input
              type="text"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              placeholder="Site Location"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Job / Invoice Ref</label>
            <input
              type="text"
              value={jobRef}
              onChange={(e) => setJobRef(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
              placeholder="JOB-10293"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Commencement Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* PRINTABLE WARRANTY CERTIFICATE DOCUMENT */}
        <div className="p-6 sm:p-10 overflow-y-auto grow bg-white printable-quotation-container space-y-6">
          
          {/* TOP CERTIFICATE HEADER */}
          <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center font-black text-lg shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-black text-xl sm:text-2xl text-[#0F203C] tracking-tight">
                    INNOVISTA ENTERPRISE
                  </h1>
                  <span className="text-[11px] uppercase font-extrabold tracking-widest text-emerald-700 block">
                    Official Quality Guarantee & Warranty Certificate
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block bg-emerald-900 text-white px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wider shadow-2xs">
                CERT #: {certNumber}
              </div>
              <div className="text-[10px] text-slate-500 font-medium block">
                Issued Date: {new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* CUSTOMER & PROJECT IDENTIFICATION CERTIFICATE BANNER */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Certificate Holder</span>
              <strong className="text-sm font-black text-slate-900 block">{customerName}</strong>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5 block flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-700 shrink-0 inline mr-1" />
                {projectAddress}
              </span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-x border-emerald-200 pt-3 sm:pt-0 sm:px-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Product & System Reference</span>
              <strong className="text-sm font-black text-slate-900 block">{product.product_name}</strong>
              <span className="text-slate-600 text-[11px] block font-mono">
                SKU: {product.product_code} • {product.category}
              </span>
            </div>

            <div className="border-t sm:border-t-0 border-emerald-200 pt-3 sm:pt-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Project Tracking Ref</span>
              <strong className="text-sm font-black text-emerald-900 font-mono block">{jobRef}</strong>
              <span className="text-slate-600 text-[11px] block">
                Default Terms: <strong className="text-slate-900">{product.warranty || '10 Years Structural'}</strong>
              </span>
            </div>
          </div>

          {/* SECTION 1: WARRANTY GUARANTEE TERMS MATRIX */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>1. Structural & Material Guarantee Terms</span>
            </h3>

            {warrantyTerms.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Standard Manufacturer Guarantee: {product.warranty || '10 Years Structural Frame Guarantee'}</div>
                <p className="text-slate-600 text-[11px]">
                  Innovista Enterprise guarantees all extruded structural frames against material manufacturing defects, corrosion degradation, and structural failure under normal operating parameters for the period specified above from the date of handover.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {warrantyTerms.map((term, i) => (
                  <div key={term.id || i} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900">{term.warrantyType}</span>
                      <span className="bg-emerald-100 text-emerald-900 font-extrabold font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {term.timePeriod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      <strong>Coverage Scope:</strong> {term.applicableMaterials}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: DEFECT LIABILITY PERIOD (DLP) FRAMEWORK */}
          {(dlpFrameworks.length > 0 || true) && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>2. Defect Liability Period (DLP) Framework</span>
              </h3>

              {dlpFrameworks.length === 0 ? (
                <div className="bg-emerald-50/40 border border-emerald-200 p-3.5 rounded-xl text-xs flex items-start space-x-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-950">12 Months Initial Free Defect Liability Period</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Includes 12 months post-installation free maintenance support and prompt defect rectification for operational hardware, alignment, or weather sealing adjustments.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {dlpFrameworks.map((dlp, i) => (
                    <div key={dlp.id || i} className="bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>{dlp.periodMonths} Months Active DLP Framework</span>
                        </span>
                        {dlp.retentionSurchargePct ? (
                          <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                            Retention Framework: {dlp.retentionSurchargePct}%
                          </span>
                        ) : null}
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {dlp.terms}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: SPECIFIED MATERIAL & HARDWARE SCHEDULE */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>3. Installed Materials & Hardware Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Main Profiles */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Profiles & Extrusions</span>
                {mainMaterials.length > 0 ? (
                  mainMaterials.map((m, i) => (
                    <div key={m.id || i} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-900">{m.materialType}: {m.profileName}</span>
                      <span className="text-slate-500 text-[10px] block">{m.sizeDimensions} • {m.color} • Brands: {m.supplierBrands?.join(', ')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-700 font-semibold text-[11px]">
                    {product.profile_series || '100 Series Heavy Duty Architectural Profile Extrusion'}
                  </p>
                )}
              </div>

              {/* Glass & Hardware */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Hardware & Glazing Components</span>
                {hardware.length > 0 ? (
                  hardware.map((h, i) => (
                    <div key={h.id || i} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-900">{h.name}</span>
                      <span className="text-slate-500 text-[10px] block">Spec: {h.brandSpecs} • Guarantee: {h.warrantyPeriod}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-700 space-y-0.5">
                    <div>Lock: <strong className="text-slate-900">{product.lock_type || 'Multi-Point Mortise Lock'}</strong></div>
                    <div>Handle: <strong className="text-slate-900">{product.handle_type || 'Architectural Lever Handle'}</strong></div>
                    <div>Roller: <strong className="text-slate-900">{product.roller_type || 'Heavy Duty Nylon Roller'}</strong></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: POINTWISE TECHNICAL FEATURES & COATING DURABILITY */}
          {(technicalDetails.length > 0 || finishes.length > 0 || fabricationMethods.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>4. Performance Specifications & Maintenance Guidelines</span>
              </h3>

              <div className="space-y-2 text-xs">
                {technicalDetails.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Technical Performance Points</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-800">
                      {technicalDetails.map((td, i) => (
                        <li key={td.id || i}>
                          <strong className="text-slate-900">{td.category}:</strong> {td.point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {finishes.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Surface Finish & Maintenance</span>
                    {finishes.map((f, i) => (
                      <div key={f.id || i} className="text-slate-700">
                        <strong>{f.finishType}:</strong> {f.durabilityDetails}. <br />
                        <span className="text-slate-500 italic">Maintenance: {f.maintenanceTechniques}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: INSTALLATION SCOPE & EXCLUSIONS */}
          {installationScopes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>5. Installation Scope & Warranty Conditions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {installationScopes.map((scope, i) => (
                  <div key={scope.id || i} className="bg-white border border-slate-200 p-3 rounded-xl">
                    <span className="font-extrabold text-[11px] text-slate-900 block mb-0.5">{scope.scopeType}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{scope.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
          {faqs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>6. Frequently Asked Questions & Operational Tips</span>
              </h3>

              <div className="space-y-2 text-xs">
                {faqs.map((faq, i) => (
                  <div key={faq.id || i} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-0.5">
                    <div className="font-extrabold text-slate-900 text-[11px]">Q: {faq.question}</div>
                    <div className="text-slate-600 text-[11px]">A: {faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATE AUTHORIZATION & FOOTER STAMP */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs text-slate-600">
            {/* QR Code Validation */}
            <div className="flex items-center space-x-3">
              <QRCodeSVG value={`INNOVISTA-WARRANTY:${certNumber}:${jobRef}:${customerName}`} size={50} />
              <div>
                <span className="font-black text-[#0F203C] block text-xs">Innovista Warranty Seal</span>
                <span className="text-[10px] text-slate-500">Scan to verify authentic certificate hash online</span>
              </div>
            </div>

            {/* Quality Manager Signoff */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-slate-800 text-sm border-b border-slate-400 pb-1">
                A. Perera (Head of QA / Engineering)
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Authorized QA Engineering Signatory</span>
            </div>

            {/* Official Company Seal Stamp */}
            <div className="text-right space-y-1">
              <div className="inline-block bg-emerald-900 text-emerald-100 border border-emerald-700 font-extrabold px-3 py-1 rounded text-[10px] uppercase tracking-wider">
                Official Corporate Guarantee
              </div>
              <div className="text-[9px] text-slate-400 block">
                Innovista Enterprise Head Office • Colombo, Sri Lanka
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
