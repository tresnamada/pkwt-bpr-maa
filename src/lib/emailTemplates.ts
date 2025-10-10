import { EmailReminderData } from '@/types/email';

export function generateReminderEmailHTML(data: EmailReminderData): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Evaluasi PKWT</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header dengan gradient merah -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🔔 Pengingat Evaluasi PKWT
              </h1>
              <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 14px;">
                BPR MAA - Sistem Manajemen Karyawan Kontrak
              </p>
            </td>
          </tr>
          
          <!-- Konten Utama -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Pesan Pembuka -->
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Halo Admin,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                ${data.daysRemaining < 0 
                  ? `Ini adalah pengingat bahwa karyawan PKWT berikut sudah melewati masa kontrak dan <strong style="color: #dc2626;">BELUM DIEVALUASI</strong>:`
                  : `Ini adalah pengingat bahwa karyawan PKWT berikut akan segera berakhir masa kontraknya dan memerlukan evaluasi:`
                }
              </p>
              
              <!-- Info Karyawan Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <h2 style="margin: 0; color: #991b1b; font-size: 20px; font-weight: bold;">
                            ${data.employeeName}
                          </h2>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fecaca;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40%" style="color: #6b7280; font-size: 14px; font-weight: 600;">
                                Unit / Cabang:
                              </td>
                              <td style="color: #1f2937; font-size: 14px; font-weight: 500;">
                                ${data.unit}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fecaca;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40%" style="color: #6b7280; font-size: 14px; font-weight: 600;">
                                Tanggal Akhir Kontrak:
                              </td>
                              <td style="color: #1f2937; font-size: 14px; font-weight: 500;">
                                ${data.contractEndDate}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding-top: 20px;">
                          <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, ${data.daysRemaining < 0 ? '#b91c1c 0%, #7f1d1d 100%' : '#dc2626 0%, #991b1b 100%'}); border-radius: 8px; padding: 15px 20px;">
                            <tr>
                              <td align="center">
                                ${data.daysRemaining < 0 
                                  ? `<span style="color: #ffffff; font-size: 28px; font-weight: bold;">
                                      ${Math.abs(data.daysRemaining)}
                                    </span>
                                    <span style="color: #fecaca; font-size: 14px; font-weight: 600; margin-left: 8px;">
                                      hari terlambat
                                    </span>`
                                  : `<span style="color: #ffffff; font-size: 28px; font-weight: bold;">
                                      ${data.daysRemaining}
                                    </span>
                                    <span style="color: #fecaca; font-size: 14px; font-weight: 600; margin-left: 8px;">
                                      hari lagi
                                    </span>`
                                }
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                      📋 Evaluasi Sekarang
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Tambahan -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      <strong style="color: #1f2937;">📌 Tindakan yang diperlukan:</strong>
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                      <li>Review kinerja karyawan selama masa kontrak</li>
                      <li>Tentukan keputusan: Lanjut / Diangkat / Dilepas</li>
                      <li>Isi form evaluasi di dashboard</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Pesan Penutup -->
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ${data.daysRemaining < 0 
                  ? `<strong style="color: #dc2626;">⚠️ URGENT:</strong> Karyawan ini sudah melewati masa kontrak dan harus segera dievaluasi. Email pengingat ini akan terus dikirim setiap hari hingga evaluasi diselesaikan.`
                  : `Email pengingat ini akan terus dikirim setiap hari hingga evaluasi diselesaikan.`
                }
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                Email ini dikirim secara otomatis oleh Sistem PKWT BPR MAA
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} BPR MAA. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateReminderEmailText(data: EmailReminderData): string {
  const isOverdue = data.daysRemaining < 0;
  const daysDisplay = isOverdue ? Math.abs(data.daysRemaining) : data.daysRemaining;
  
  return `
🔔 PENGINGAT EVALUASI PKWT - BPR MAA

Halo Admin,

${isOverdue 
  ? `⚠️ URGENT: Ini adalah pengingat bahwa karyawan PKWT berikut sudah melewati masa kontrak dan BELUM DIEVALUASI:`
  : `Ini adalah pengingat bahwa karyawan PKWT berikut akan segera berakhir masa kontraknya dan memerlukan evaluasi:`
}

INFORMASI KARYAWAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nama: ${data.employeeName}
Unit / Cabang: ${data.unit}
Tanggal Akhir Kontrak: ${data.contractEndDate}

${isOverdue 
  ? `⚠️ STATUS: ${daysDisplay} HARI TERLAMBAT`
  : `⏰ SISA WAKTU: ${daysDisplay} HARI LAGI`
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TINDAKAN YANG DIPERLUKAN:
• Review kinerja karyawan selama masa kontrak
• Tentukan keputusan: Lanjut / Diangkat / Dilepas
• Isi form evaluasi di dashboard

Klik link berikut untuk melakukan evaluasi:
${data.dashboardLink}

${isOverdue 
  ? `⚠️ URGENT: Karyawan ini sudah melewati masa kontrak dan harus segera dievaluasi. Email pengingat ini akan terus dikirim setiap hari hingga evaluasi diselesaikan.`
  : `Email pengingat ini akan terus dikirim setiap hari hingga evaluasi diselesaikan.`
}

---
Email ini dikirim secara otomatis oleh Sistem PKWT BPR MAA
© ${new Date().getFullYear()} BPR MAA. All rights reserved.
  `;
}
