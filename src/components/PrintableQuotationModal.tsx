import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Barcode1D } from './BarcodeGenerator';
import { Printer, Download, X, Building2, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { Quotation, Branch } from '../types';
import { generateAndDownloadQuotationPDF } from '../utils/pdfExportEngine';

interface PrintableQuotationModalProps {
  quotation: Quotation;
  activeBranch?: Branch;
  onClose: () => void;
}

export const PrintableQuotationModal: React.FC<PrintableQuotationModalProps> = ({
  quotation,
  activeBranch,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const branchToUse = activeBranch || {
    id: quotation.branch_id || 'ho-central',
    code: quotation.branch_code || 'HO',
    name: quotation.branch_name || 'Head Office Central',
    location: 'Colombo, Sri Lanka',
    status: 'Online',
    last_sync: 'Just now',
    active_users: 5,
    manager_name: quotation.created_by || 'Head Office Administrator'
  };

  const materialSubtotal = quotation.material_subtotal || 
    quotation.items.reduce((acc, item) => acc + (item.total_price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F203C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto text-[#0F203C]">
        
        {/* MODAL CONTROLS HEADER (Hidden during printing via CSS) */}
        <div className="p-4 bg-[#0F203C] text-white flex items-center justify-between shrink-0 border-b border-slate-800 printable-modal-header no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#E87F24] rounded-xl text-white shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
                <span>Quotation Print & Export Preview</span>
                <span className="bg-[#FFC81E] text-[#0F203C] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {quotation.quotation_number}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                A clean, high-contrast, printer-friendly layout optimized for A4 paper and PDF archiving.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 printable-modal-controls">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#E87F24] hover:bg-[#D26E1A] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
              title="Print clean quotation using browser print engine (Ctrl + P)"
            >
              <Printer className="w-4 h-4 text-[#FFC81E]" />
              <span>Print Quotation</span>
            </button>

            <button
              type="button"
              onClick={() => generateAndDownloadQuotationPDF(quotation, undefined, branchToUse)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
              title="Download PDF Document"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto grow bg-slate-50 printable-quotation-container">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm max-w-3xl mx-auto">
            
            {/* 1. BRANDING & QUOTATION HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#0F203C] pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F203C] text-[#FFC81E] font-bold flex items-center justify-center text-sm shadow-2xs">
                    IN
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F203C] tracking-tight">
                    INNOVISTA ENTERPRISE
                  </h1>
                </div>
                <p className="text-xs font-bold text-[#E87F24]">
                  Aluminium & Glass Systems • Head Office Central Network
                </p>
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <p>124 Industrial Zone, Kotte Road, Colombo, Sri Lanka</p>
                  <p>Hotlines: +94 11 234 5678 / +94 77 123 4567 • Email: sales@innovista.lk</p>
                  <p>VAT Reg No: 114589204-7000 • Web: www.innovista.lk</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2 shrink-0">
                <div className="inline-block bg-[#0F203C] text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
                  OFFICIAL QUOTATION
                </div>
                <div className="font-mono text-sm font-bold text-[#0F203C]">
                  {quotation.quotation_number}
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>Date: <strong>{quotation.date || new Date().toISOString().split('T')[0]}</strong></p>
                  <p>Valid Until: <strong>{quotation.valid_until || '30 Days'}</strong></p>
                  <p>Branch: <strong>{quotation.branch_name || branchToUse.name}</strong></p>
                </div>

                {/* BARCODE & QR CODE FOR SCANNABILITY */}
                <div className="pt-2 flex items-center justify-start sm:justify-end space-x-2">
                  <Barcode1D value={quotation.barcode || quotation.quotation_number} height={32} width={1.3} />
                  <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
                    <QRCodeSVG 
                      value={JSON.stringify({
                        num: quotation.quotation_number,
                        total: quotation.net_total,
                        cust: quotation.customer_name
                      })} 
                      size={42} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & SITE DETAILS BOX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FEFDDF]/60 p-4 rounded-xl border border-[#FFC81E]/60 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#D26E1A] uppercase tracking-wider block">
                  CUSTOMER DETAILS
                </span>
                <h4 className="font-bold text-[#0F203C] text-sm">{quotation.customer_name}</h4>
                {quotation.customer_phone && <p className="text-slate-700 font-mono">Phone: {quotation.customer_phone}</p>}
                {quotation.customer_email && <p className="text-slate-700">Email: {quotation.customer_email}</p>}
                {quotation.customer_address && <p className="text-slate-700">Address: {quotation.customer_address}</p>}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-bold text-[#D26E1A] uppercase tracking-wider block">
                  PROJECT & SITE DELIVERY
                </span>
                <p className="font-bold text-[#0F203C]">{quotation.site_address || 'Colombo Site Location'}</p>
                <p className="text-slate-700">Location Zone: <strong>{quotation.site_location_name || 'Colombo Region'}</strong></p>
                <p className="text-slate-700">Prepared By: <strong>{quotation.created_by || branchToUse.manager_name}</strong></p>
                {quotation.external_software_ref && (
                  <p className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded inline-block mt-1">
                    ERP Ref: {quotation.external_software_ref}
                  </p>
                )}
              </div>
            </div>

            {/* 3. ITEMIZED SPECIFICATION TABLE */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0F203C] uppercase tracking-wider block">
                Itemized Scope of Supply & Specifications
              </span>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0F203C] text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 border-r border-slate-800">#</th>
                      <th className="p-3 border-r border-slate-800">Item Description</th>
                      <th className="p-3 border-r border-slate-800 text-center">Unit</th>
                      <th className="p-3 border-r border-slate-800 text-center">Qty</th>
                      <th className="p-3 border-r border-slate-800 text-right">Unit Rate (LKR)</th>
                      <th className="p-3 text-right">Total Price (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {quotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 print-avoid-break">
                        <td className="p-3 font-mono font-bold text-slate-500 text-center">{idx + 1}</td>
                        <td className="p-3 space-y-0.5">
                          <div className="font-bold text-[#0F203C]">{item.product_name}</div>
                          <div className="font-mono text-[10px] text-[#E87F24]">Code: {item.product_code}</div>
                          {(item.thickness_applied || item.finish_applied || item.glass_type_applied || item.spec_surcharges_applied || item.custom_options_applied) && (
                            <div className="text-[10px] text-slate-500 pt-0.5 flex flex-wrap gap-2">
                              {item.thickness_applied && <span>Gauge: {item.thickness_applied}</span>}
                              {item.finish_applied && <span>Finish: {item.finish_applied}</span>}
                              {item.glass_type_applied && <span>Glass: {item.glass_type_applied}</span>}
                              {item.spec_surcharges_applied && Object.entries(item.spec_surcharges_applied).map(([k, s]) => {
                                const spec = s as { categoryName: string; optionName: string; surchargeLkr: number };
                                return <span key={k} className="text-slate-700 font-medium"><strong>{spec.categoryName}:</strong> {spec.optionName}</span>;
                              })}
                              {item.custom_options_applied && Object.entries(item.custom_options_applied).map(([k, opt]) => {
                                const customOpt = opt as { categoryName: string; optionName: string; surchargeLkr: number };
                                return <span key={k} className="text-orange-700 font-medium"><strong>{customOpt.categoryName}:</strong> {customOpt.optionName}</span>;
                              })}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">{item.unit || 'nos'}</td>
                        <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-700">
                          Rs. {item.unit_price.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0F203C]">
                          Rs. {item.total_price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. FINANCIAL SUMMARY BREAKDOWN */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
              <div className="w-full sm:w-1/2 space-y-2 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Payment & Terms Notice</span>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    <li>50% Advance upon order confirmation, balance prior to delivery.</li>
                    <li>Prices are valid for 30 days from quotation issue date.</li>
                    <li>Custom fabrication Lead Time: 7 to 10 working days.</li>
                  </ul>
                </div>
              </div>

              <div className="w-full sm:w-1/2 bg-[#0F203C] text-white rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Materials Subtotal:</span>
                  <span>Rs. {materialSubtotal.toLocaleString()}</span>
                </div>

                {quotation.transport_cost > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Transport & Logistics:</span>
                    <span>+ Rs. {quotation.transport_cost.toLocaleString()}</span>
                  </div>
                )}

                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Special Discount:</span>
                    <span>- Rs. {quotation.discount_amount.toLocaleString()}</span>
                  </div>
                )}

                {quotation.tax_amount > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>VAT Tax (18%):</span>
                    <span>+ Rs. {quotation.tax_amount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-bold text-[#FFC81E] pt-2 border-t border-slate-700">
                  <span>NET GRAND TOTAL:</span>
                  <span className="text-base font-bold">Rs. {quotation.net_total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 5. AUTHORIZED SIGNATURE BLOCKS */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs text-slate-600 print-avoid-break">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                <span className="font-bold text-[#0F203C] block">Prepared By</span>
                <span className="text-[10px] text-slate-500">{quotation.created_by || 'Sales Representative'}</span>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                <span className="font-bold text-[#0F203C] block">Customer Acceptance</span>
                <span className="text-[10px] text-slate-500">Sign & Stamp</span>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                <span className="font-bold text-[#0F203C] block">Authorized Manager</span>
                <span className="text-[10px] text-slate-500">Innovista Head Office</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              This document is generated by INNOVISTA POS & Enterprise ERP. For inquiries, contact Head Office Central.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
