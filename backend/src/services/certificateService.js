import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate certificate PDF
 */
export const generateCertificate = async (certificateData) => {
  const { studentName, courseTitle, subjectName, certificateId, issueDate, verificationCode } = certificateData;

  // Create certificates directory if it doesn't exist
  const certDir = path.join(__dirname, '../../uploads/certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const fileName = `certificate-${certificateId}.pdf`;
  const filePath = path.join(certDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

    // Border
    doc
      .lineWidth(5)
      .strokeColor('#0ea5e9')
      .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
      .stroke();

    // Title
    doc
      .fontSize(48)
      .fillColor('#0ea5e9')
      .text('CERTIFICATE OF COMPLETION', {
        align: 'center',
        y: 150,
      });

    // Subtitle
    doc
      .fontSize(20)
      .fillColor('#6b7280')
      .text('This is to certify that', {
        align: 'center',
        y: 250,
      });

    // Student Name
    doc
      .fontSize(36)
      .fillColor('#111827')
      .text(studentName, {
        align: 'center',
        y: 300,
      });

    // Course Title
    doc
      .fontSize(18)
      .fillColor('#6b7280')
      .text(`has successfully completed the course`, {
        align: 'center',
        y: 370,
      });

    doc
      .fontSize(24)
      .fillColor('#0ea5e9')
      .text(courseTitle, {
        align: 'center',
        y: 410,
      });

    // Subject name (if provided)
    if (subjectName) {
      doc
        .fontSize(16)
        .fillColor('#6b7280')
        .text(`Subject: ${subjectName}`, {
          align: 'center',
          y: 450,
        });
    }

    // Date
    doc
      .fontSize(14)
      .fillColor('#6b7280')
      .text(`Issued on: ${new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`, {
        align: 'center',
        y: 480,
      });

    // Certificate ID
    doc
      .fontSize(12)
      .fillColor('#9ca3af')
      .text(`Certificate ID: ${certificateId}`, {
        align: 'center',
        y: 520,
      });

    // Verification Code
    doc
      .fontSize(10)
      .fillColor('#9ca3af')
      .text(`Verification Code: ${verificationCode}`, {
        align: 'center',
        y: 550,
      });

    doc.end();

    stream.on('finish', () => {
      resolve({
        filePath,
        fileName,
        url: `/uploads/certificates/${fileName}`,
      });
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

export default {
  generateCertificate,
};

