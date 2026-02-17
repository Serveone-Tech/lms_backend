import fs from "fs";
import path from "path";
export const generateCertificateHTML = ({
  studentName,
  courseName,
  issueDate,
  certificateId,
  qrCodeImage,
}) => {
  const formattedDate = new Date(issueDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getBase64Image = (fileName) => {
    const filePath = path.join(process.cwd(), "certificates/assets", fileName);
    const image = fs.readFileSync(filePath);
    return `data:image/png;base64,${image.toString("base64")}`;
  };

  const logoBase64 = getBase64Image("logo.png");
  const bspBase64 = getBase64Image("bsp.png");
  const devBase64 = getBase64Image("dev.png");
  const logoWhiteBase64 = getBase64Image("logo-white.png");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .certificate {
        width: 1123px;
        height: 794px;
        display: flex;
        background: linear-gradient(135deg, #f0f2ff 0%, #e8ebff 100%);
        border: 8px solid #b8a3ff;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }

      /* Decorative circles in background */
      .certificate::before {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        top: -100px;
        right: -100px;
        z-index: 0;
      }

      .certificate::after {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        bottom: -80px;
        right: 100px;
        z-index: 0;
      }

      .left-panel {
        width: 370px;
        background: linear-gradient(180deg, #1ba5c3 0%, #7d5be0 100%);
        color: white;
        padding: 0;
        position: relative;
        z-index: 1;
      }

      .date-box {
        border: 3px solid white;
        padding: 25px 30px;
        text-align: center;
        margin: 80px 70px;
        margin-bottom: 0;
      }

      .date-box small {
        letter-spacing: 3px;
        font-size: 14px;
        font-weight: 400;
        display: block;
        margin-bottom: 8px;
      }

      .date-box .date-line {
        width: 100%;
        height: 2px;
        background: white;
        margin: 12px 0;
      }

      .date-box h3 {
        margin: 0;
        font-weight: 400;
        font-size: 20px;
        letter-spacing: 1px;
      }

      .powered {
        position: absolute;
        bottom: 80px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 13px;
        padding: 0 40px;
      }

      .powered-text {
        font-size: 16px;
        font-weight: 300;
        margin-bottom: 15px;
        letter-spacing: 1px;
      }

      .logo-box {
        width: 180px;
        height: 60px;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 20px;
      }

      .company-name {
        font-size: 21px;
        font-weight: 300;
        letter-spacing: 1px;
        line-height: 1.4;
      }

      .content {
        flex: 1;
        padding: 60px 80px 60px 60px;
        position: relative;
        z-index: 1;
      }

      .top-logo {
        position: absolute;
        top: 40px;
        right: 60px;
        width: 140px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: #1ba5c3;
        border-radius: 4px;
      }

      h1 {
        font-size: 70px;
        margin: 0;
        color: #1ba5c3;
        font-weight: 600;
        letter-spacing: 2px;
        line-height: 1;
      }

      h2 {
        font-size: 68px;
        margin: -10px 0 0 0;
        font-weight: 700;
        color: #000;
        letter-spacing: 1px;
        line-height: 1;
      }

      .course-badge {
        margin-top: 30px;
        display: inline-block;
        padding: 8px 30px;
        border: 2.5px solid #1ba5c3;
        border-radius: 25px;
        font-size: 18px;
        color: #000;
        font-weight: 500;
      }

      .given-text {
        margin-top: 25px;
        font-size: 18px;
        color: #000;
        font-weight: 400;
      }

      .student-name {
        margin-top: 20px;
        font-size: 52px;
        color: #1ba5c3;
        font-weight: 700;
        border-bottom: 4px solid #1ba5c3;
        display: inline-block;
        padding-bottom: 8px;
        letter-spacing: 1px;
      }

      .description {
        margin-top: 25px;
        font-size: 16px;
        line-height: 1.6;
        max-width: 650px;
        color: #000;
      }

      .footer {
        position: absolute;
        bottom: 70px;
        left: 60px;
        right: 60px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .director {
        text-align: center;
        font-size: 14px;
        flex: 0 0 180px;
      }

      .signature-box {
        width: 140px;
        height: 50px;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #999;
        border-radius: 3px;
      }

      .director strong {
        font-weight: 700;
        font-size: 16px;
        display: block;
        margin-bottom: 2px;
        color: #000;
      }

      .director-title {
        font-weight: 600;
        font-size: 15px;
        color: #000;
      }

      .medal-section {
        flex: 0 0 80px;
        text-align: center;
        margin-bottom: 10px;
      }

      .medal {
        width: 100px;
        height: 100px;
        object-fit: contain;
      }

      .qr {
        flex: 0 0 80px;
        right: 60px;
        bottom: 40px;
        text-align: center;
        font-size: 12px;
      }

      .qr img {
        width: 60px;
        height: 60px;
        border: 2px solid #1ba5c3;
        padding: 4px;
        background: white;
        border-radius: 4px;
      }

      .cert-id {
        position: absolute;
        bottom: 20px;
        left: 400px;
        font-size: 11px;
        color: #666;
        z-index: 2;
      }

      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 90px;
        color: rgba(0, 0, 0, 0.03);
        font-weight: bold;
        z-index: 0;
      }

    </style>
  </head>

  <body>
    <div class="certificate">

      <div class="left-panel">
        <div class="date-box">
          <small>DATE OF ISSUE</small>
          <div class="date-line"></div>
          <h3>${formattedDate}</h3>
        </div>

        <div class="powered">
          <div class="powered-text">Powered By</div>
          <div class="logo-box">
           <img src="${logoWhiteBase64}" 
       alt="Zalgo Logo"
       style="width:100%; height:100%; object-fit:contain;" />
        </div>
          <div class="company-name">
            ZALGO INFOTECH<br>
            Private Limited
          </div>
        </div>
      </div>

      <div class="content">

        <div class="top-logo">
          <img src="${logoBase64}" alt="Zalgo Logo" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>

        <h1>Certificate</h1>
        <h2>Of Completion</h2>

        <div class="course-badge">${courseName}</div>

        <div class="given-text">This Certificate Is Given To</div>

        <div class="student-name">${studentName}</div>

        <div class="description">
          This certificate is awarded to <strong>${studentName}</strong> in recognition of the 
          successful completion of <strong>${courseName}</strong>. Through this course, the 
          participant has demonstrated a strong commitment to learning and enhancing their 
          professional skills with Zalgo Edutech.
        </div>

        <div class="footer">

          <div class="director">
            <div class="signature-box">
  <img src="${bspBase64}" 
       alt="Signature"
       style="width:100%; height:100%; object-fit:contain;" />
</div>
            <strong>Bhupendra Parmar</strong>
            <div class="director-title">Director</div>
          </div>

          <div class="qr">
          <img src="${qrCodeImage}" alt="QR Code" />
          <div>Scan to Verify</div>
        </div>

          <div class="director">
            <div class="signature-box">
          <img src="${devBase64}" 
              alt="Signature"
              style="width:100%; height:100%; object-fit:contain;" />
           </div>
            <strong>Lokendra Parmar</strong>
            <div class="director-title">Director</div>
          </div>

        </div>

        <div class="cert-id">
          Certificate ID: ${certificateId}
        </div>

        <div class="watermark">
          ZALGO INFOTECH
        </div>

      </div>

    </div>
  </body>
  </html>
  `;
};
