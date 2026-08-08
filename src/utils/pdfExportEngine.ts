import { Quotation, Branch, CompanySettings } from '../types';

export const DEFAULT_COMPANY_INFO: CompanySettings = {
  company_name: 'INNOVISTA ALUMINIUM & GLASS POS SYSTEM',
  tagline: 'Enterprise Architectural Systems & Multi-Branch Network',
  logo_url: '',
  registration_no: 'PV-98234-SL',
  tax_vat_id: 'VAT-10029384-7000',
  phone: '+94 11 288 9000 / +94 77 345 6789',
  email: 'info@innovistapos.lk',
  address: 'No. 102 Innovista Tower, Nawala Road, Rajagiriya, Colombo',
  website: 'www.innovistapos.lk',
  bank_details: {
    bank_name: 'Commercial Bank of Ceylon PLC',
    account_number: '1000-849201-001',
    account_name: 'Innovista Aluminium & Glass Systems (Pvt) Ltd',
    branch_name: 'Nawala Corporate Branch',
    swift_code: 'CCEYLKCX'
  },
  currencies: [
    { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', exchange_rate_to_lkr: 1.0, is_default: true }
  ],
  invoice_footer_terms: '1. All prices are valid for 14 days from date of issue.\n2. 50% advance payment required upon order confirmation.\n3. Goods once sold are non-refundable unless verified for manufacturing defect within 7 days.'
};

/**
 * Builds standard clean printable HTML content for any Quotation
 */
export function buildQuotationHtml(
  quotation: Quotation,
  companyInfo?: CompanySettings,
  branch?: Branch
): string {
  const comp = companyInfo || DEFAULT_COMPANY_INFO;
  const items = quotation.items || [];

  const subtotal = quotation.subtotal_price || items.reduce((acc, it) => acc + (it.total_price || 0), 0);
  const transportCost = quotation.transport_cost || 0;
  const netTotal = quotation.net_total || (subtotal + transportCost);
  const totalWeight = quotation.total_weight_kg || items.reduce((acc, it) => acc + ((it.weight_kg || 1) * (it.quantity || 1)), 0);

  const itemsRows = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
      <td style="padding: 8px 10px; text-align: center; color: #64748b; font-weight: bold;">${index + 1}</td>
      <td style="padding: 8px 10px;">
        <span style="font-family: monospace; font-weight: bold; color: #ea580c; background: #fff7ed; padding: 2px 4px; border-radius: 4px; border: 1px solid #fed7aa; font-size: 10px;">
          ${item.product_code}
        </span>
        <div style="font-weight: bold; color: #0f172a; margin-top: 2px;">${item.product_name}</div>
        ${item.price_source_label ? `<span style="font-size: 9px; color: #64748b;">${item.price_source_label}</span>` : ''}
        ${item.spec_surcharges_applied ? `<div style="font-size: 8.5px; color: #475569; margin-top: 2px;">${Object.values(item.spec_surcharges_applied).map(s => `<b>${s.categoryName}:</b> ${s.optionName}`).join(' | ')}</div>` : ''}
        ${item.custom_options_applied ? `<div style="font-size: 8.5px; color: #c2410c; margin-top: 2px;">${Object.values(item.custom_options_applied).map(s => `<b>${s.categoryName}:</b> ${s.optionName}`).join(' | ')}</div>` : ''}
      </td>
      <td style="padding: 8px 10px; text-align: center; font-weight: 600; color: #334155;">
        ${item.unit || 'Unit'}
      </td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #0f172a;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-weight: 600; color: #334155;">
        Rs. ${(item.unit_price || 0).toLocaleString()}
      </td>
      <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">
        Rs. ${(item.total_price || 0).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation ${quotation.quotation_number} - Innovista ERP</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      color: #0f172a;
      background-color: #ffffff;
      padding: 24px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      margin-bottom: 20px;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 12px;
    }
    .company-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .badge-approved {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-draft {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .table-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-items th {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-box {
      float: right;
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      margin-top: 10px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
      color: #475569;
    }
    .summary-row.total {
      border-top: 2px solid #ea580c;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
    }
    .terms-box {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
      color: #64748b;
      clear: both;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      page-break-inside: avoid;
    }
    .signature-line {
      width: 200px;
      border-top: 1px solid #94a3b8;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      padding-top: 4px;
      font-weight: 600;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Printable Action Bar in Screen Mode -->
  <div class="no-print" style="margin-bottom: 20px; background: #0f172a; color: #fff; padding: 12px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <strong style="color: #fb923c;">INNOVISTA ERP OFFICIAL PDF EXPORT</strong>
      <span style="margin-left: 10px; font-size: 11px; color: #cbd5e1;">Quotation #${quotation.quotation_number}</span>
    </div>
    <div>
      <button onclick="window.print()" style="background: #ea580c; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; margin-right: 8px;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #334155; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">
        Close
      </button>
    </div>
  </div>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: top; width: 60%;">
        <div class="company-title">${comp.company_name}</div>
        <div style="font-size: 11px; color: #ea580c; font-weight: bold; margin-bottom: 4px;">${comp.tagline}</div>
        <div style="font-size: 10px; color: #475569;">${comp.address}</div>
        <div style="font-size: 10px; color: #475569;">Tel: ${comp.phone} | Email: ${comp.email}</div>
        <div style="font-size: 10px; color: #475569;">VAT / Tax Reg: <strong>${comp.tax_vat_id}</strong> | Co Reg: <strong>${comp.registration_no}</strong></div>
      </td>
      <td style="vertical-align: top; text-align: right; width: 40%;">
        <div style="font-size: 20px; font-weight: 900; color: #ea580c; text-transform: uppercase;">
          OFFICIAL QUOTATION
        </div>
        <div style="font-size: 12px; font-weight: bold; font-family: monospace; color: #0f172a; margin-top: 2px;">
          # ${quotation.quotation_number}
        </div>
        <div style="margin-top: 6px;">
          <span class="badge ${quotation.status.includes('Approved') || quotation.status.includes('Validated') ? 'badge-approved' : 'badge-draft'}">
            ${quotation.status}
          </span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
          Date: <strong>${quotation.date || new Date().toISOString().split('T')[0]}</strong>
        </div>
        <div style="font-size: 10px; color: #64748b;">
          Valid Until: <strong>${quotation.expiry_date || '30 Days from Issue'}</strong>
        </div>
      </td>
    </tr>
  </table>

  <!-- Customer & Job Details Grid -->
  <table style="width: 100%; margin-bottom: 16px; border-collapse: separate; border-spacing: 10px 0;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding: 0;">
        <div class="info-card">
          <div style="font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; margin-bottom: 6px;">
            CUSTOMER / BILLING TO:
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${quotation.customer_name || 'Valued Client'}</div>
          ${quotation.customer_phone ? `<div style="font-size: 11px; color: #475569;">Phone: <strong>${quotation.customer_phone}</strong></div>` : ''}
          ${quotation.customer_email ? `<div style="font-size: 11px; color: #475569;">Email: ${quotation.customer_email}</div>` : ''}
          ${quotation.site_address ? `<div style="font-size: 11px; color: #475569;">Project Site: ${quotation.site_address}</div>` : ''}
        </div>
      </td>
      <td style="width: 50%; vertical-align: top; padding: 0;">
        <div class="info-card">
          <div style="font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; margin-bottom: 6px;">
            LOGISTICS & BRANCH NODE:
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
            ${branch ? branch.name : `Branch Node: ${quotation.branch_code || 'Head Office'}`}
          </div>
          <div style="font-size: 11px; color: #475569;">Vehicle Assignment: <strong>${quotation.vehicle_id ? quotation.vehicle_id.toUpperCase() : 'Standard Logistics Fleet'}</strong></div>
          <div style="font-size: 11px; color: #475569;">Total Payload Weight: <strong>${totalWeight.toFixed(1)} kg</strong></div>
          ${quotation.notes ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px;">Notes: <em>${quotation.notes}</em></div>` : ''}
        </div>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table class="table-items">
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">#</th>
        <th style="width: 45%; text-align: left;">Product Item & Specification</th>
        <th style="width: 10%; text-align: center;">Unit</th>
        <th style="width: 10%; text-align: center;">Qty</th>
        <th style="width: 15%; text-align: right;">Unit Price</th>
        <th style="width: 15%; text-align: right;">Total (LKR)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <!-- Financial Summary Box -->
  <div class="summary-box">
    <div class="summary-row">
      <span>Products Subtotal:</span>
      <span style="font-family: monospace; font-weight: bold;">Rs. ${subtotal.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Transport & Logistics Surcharge:</span>
      <span style="font-family: monospace; font-weight: bold;">Rs. ${transportCost.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Govt VAT / SSCL Tax (Included):</span>
      <span style="font-family: monospace;">Rs. 0.00</span>
    </div>
    <div class="summary-row total">
      <span>NET GRAND TOTAL:</span>
      <span style="font-family: monospace; color: #ea580c;">Rs. ${netTotal.toLocaleString()}</span>
    </div>
  </div>

  <div style="clear: both;"></div>

  <!-- Bank Payment Details -->
  <div style="margin-top: 20px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px 14px; font-size: 10px; color: #9a3412;">
    <strong>Bank Settlement Instructions:</strong> Bank: ${comp.bank_details.bank_name} | Account Name: ${comp.bank_details.account_name} | A/C No: <strong>${comp.bank_details.account_number}</strong> | Branch: ${comp.bank_details.branch_name} | Swift: ${comp.bank_details.swift_code}
  </div>

  <!-- Terms & Conditions -->
  <div class="terms-box">
    <strong>Terms & Standard Operating Conditions:</strong>
    <p style="margin-top: 4px; line-height: 1.5; white-space: pre-line;">${comp.invoice_footer_terms}</p>
  </div>

  <!-- Signatures -->
  <div class="signature-grid">
    <div class="signature-line">
      Prepared By / Estimator
      <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Innovista Engineering Team</div>
    </div>
    <div class="signature-line">
      Authorized Branch Approver
      <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Head Office / Branch Manager</div>
    </div>
    <div class="signature-line">
      Customer Acceptance Signature
      <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Date & Official Seal</div>
    </div>
  </div>

</body>
</html>
`;
}

/**
 * Downloads or prints the Quotation as a formatted PDF document
 */
export function generateAndDownloadQuotationPDF(
  quotation: Quotation,
  companyInfo?: CompanySettings,
  branch?: Branch
): void {
  const htmlContent = buildQuotationHtml(quotation, companyInfo, branch);

  // 1. Try opening clean printable window
  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  } else {
    // Fallback: download as .html print document
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quotation_${quotation.quotation_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
