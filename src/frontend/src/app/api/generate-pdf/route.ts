import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import type { VerifiedRtiOutput } from '@/types/rti';

export async function POST(req: NextRequest) {
  try {
    const data: VerifiedRtiOutput = await req.json();

    if (!data || !data.applicant || !data.publicAuthority) {
      return NextResponse.json(
        { error: 'Invalid RTI application data provided.' },
        { status: 400 }
      );
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    // Helper: auto page wrap
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 18;
      }
    };

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(26, 54, 93); // #1A365D
    doc.text('FORM A', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(11);
    doc.text('APPLICATION UNDER SECTION 6(1) OF THE RTI ACT, 2005', pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 85, 104);
    doc.text('(For obtaining information under Right to Information Act, 2005)', pageWidth / 2, y, { align: 'center' });
    y += 4;

    // Horizontal Rule
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Court Fee Stamp Box (Top Right)
    doc.setDrawColor(148, 163, 184);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - margin - 38, y - 2, 38, 22, 1.5, 1.5, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Affix Rs. 10/-', pageWidth - margin - 19, y + 4, { align: 'center' });
    doc.text('Court Fee Stamp /', pageWidth - margin - 19, y + 9, { align: 'center' });
    doc.text('Attach IPO here', pageWidth - margin - 19, y + 14, { align: 'center' });

    // TO section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('To:', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pioDesig = data.publicAuthority.designation || 'The Public Information Officer (PIO)';
    const pioAuth = data.publicAuthority.name || 'Competent Public Authority';
    const pioAddr = data.publicAuthority.officeAddress || 'Municipal Office';
    const pioDist = data.publicAuthority.district ? `${data.publicAuthority.district} - ${data.publicAuthority.pincode || ''}` : '';

    const toLines = [
      pioDesig,
      pioAuth,
      ...doc.splitTextToSize(pioAddr, contentWidth - 45),
      pioDist,
    ].filter(Boolean);

    toLines.forEach((line) => {
      doc.text(line, margin + 4, y);
      y += 4.2;
    });
    y += 2;

    // FROM section
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('From (Applicant Details):', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const appName = data.applicant.name || 'Citizen Applicant';
    const appAddr = data.applicant.address || 'Address provided on record';
    const appPin = data.applicant.pincode ? `Pincode: ${data.applicant.pincode}` : '';
    const appPhone = data.applicant.phone ? `Phone: ${data.applicant.phone}` : '';

    const fromLines = [
      appName,
      ...doc.splitTextToSize(appAddr, contentWidth - 8),
      [appPin, appPhone].filter(Boolean).join(' | '),
    ].filter(Boolean);

    fromLines.forEach((line) => {
      doc.text(line, margin + 4, y);
      y += 4.2;
    });
    y += 4;

    // Subject
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject:', margin, y);
    doc.setFont('helvetica', 'normal');
    const subjText = data.subject || 'Request for certified public records under Right to Information Act 2005.';
    const subjLines = doc.splitTextToSize(subjText, contentWidth - 18);
    doc.text(subjLines, margin + 16, y);
    y += subjLines.length * 4.4 + 4;

    // Salutation
    checkPageBreak(15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Sir / Madam,', margin, y);
    y += 4.5;
    const introText = 'Under Section 6(1) of the Right to Information Act, 2005, read with Section 2(f), please provide certified copies / inspections of the following official records and information:';
    const introLines = doc.splitTextToSize(introText, contentWidth);
    doc.text(introLines, margin, y);
    y += introLines.length * 4.3 + 4;

    // Queries
    doc.setFont('helvetica', 'bold');
    doc.text('Particulars of Information Sought:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    const queries = Array.isArray(data.queries) && data.queries.length > 0 
      ? data.queries 
      : [{ id: 1, lintedQuery: 'Provide certified copies of all work orders, sanction estimates, and inspection reports relating to the issue.' }];

    queries.forEach((q, idx) => {
      checkPageBreak(20);
      const qNum = `${idx + 1}.`;
      const qText = q.lintedQuery || (q as any).originalQuery || '';
      const wrapped = doc.splitTextToSize(qText, contentWidth - 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text(qNum, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(wrapped, margin + 8, y);
      y += wrapped.length * 4.3 + 3.5;
    });
    y += 2;

    // Period of Information
    if (data.periodOfInformation) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Period for which info is sought: ', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(data.periodOfInformation, margin + 55, y);
      y += 5.5;
    }

    // Section 6(3) Transfer Clause
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.text('Statutory Section 6(3) Transfer Notice:', margin, y);
    y += 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const sec63Text = 'In case the subject matter or any part of the information requested above falls under the jurisdiction of another public authority or department, kindly transfer this application or relevant parts thereof to the concerned Public Information Officer within 5 days as mandated under Section 6(3) of the RTI Act 2005, and intimate the applicant accordingly.';
    const sec63Lines = doc.splitTextToSize(sec63Text, contentWidth);
    doc.text(sec63Lines, margin, y);
    y += sec63Lines.length * 3.6 + 4;

    // Fee Details & Declaration
    checkPageBreak(30);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Details:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. 10/- paid via Court Fee Stamp / Postal Order / Online payment under RTI Rules.`, margin + 22, y);
    y += 5;

    doc.text('I hereby declare that I am a Citizen of India and the information sought is within the provisions of Section 2(f) and not exempt under Section 8 or 9 of the RTI Act, 2005.', margin, y, { maxWidth: contentWidth });
    y += 10;

    // Signatures / Date
    checkPageBreak(25);
    const dateStr = data.generatedAt ? new Date(data.generatedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, margin, y);
    doc.text('Yours faithfully,', pageWidth - margin - 35, y);
    y += 10;

    doc.text(`Place: ${data.publicAuthority.district || 'Tamil Nadu'}`, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`(${appName})`, pageWidth - margin - 35, y);

    // Convert to ArrayBuffer
    const pdfOutput = doc.output('arraybuffer');

    return new NextResponse(pdfOutput, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(appName).replace(/\s+/g, '_')}_RTI_Application.pdf"`,
      },
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    return NextResponse.json(
      { error: 'Failed to generate RTI PDF.', details: String(err) },
      { status: 500 }
    );
  }
}
