import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StartupStarterRegistration from '@/models/StartupStarterRegistration';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    // Find existing registration
    const registration = await StartupStarterRegistration.findOne({ 
      email: email.toLowerCase() 
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'No registration found with this email' },
        { status: 404 }
      );
    }

    // Generate QR Code
    const qrData = JSON.stringify({
      ticketId: registration.ticketId,
      name: registration.name,
      email: registration.email,
      rollNo: registration.rollNo
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    });

    // Send email
    await sendConfirmationEmail(registration, qrCodeDataURL);

    return NextResponse.json({
      success: true,
      message: 'Email resent successfully'
    });
  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(registration, qrCodeDataURL) {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Extract base64 data from data URL
  const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Registration Confirmed - Startup Starter</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0d1117; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .hero-title { font-size: 32px !important; }
      .mobile-pad { padding: 24px 20px !important; }
      .mobile-full { width: 100% !important; display: block !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0d1117;">

<!-- PREHEADER (hidden) -->
<div style="display:none;font-size:1px;color:#0d1117;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
  🎉 Your spot is confirmed! Open to view your QR ticket & event details — Startup Starter Bootcamp.
</div>

<!-- WRAPPER -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d1117;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- MAIN CONTAINER -->
      <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- ══════════ HERO ══════════ -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1b4d 0%,#1a1040 50%,#2a1060 100%);border-radius:20px 20px 0 0;padding:44px 40px 36px;text-align:center;">

            <!-- LOGOS ROW -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                    <tr>
                      <td style="padding-right:16px;">
                        <img src="https://res.cloudinary.com/dv9qp6pua/image/upload/v1777223659/logo2_c78exj.png"
                             alt="TechBuddySpace" width="110" height="44"
                             style="height:44px;width:auto;max-width:120px;display:block;" />
                      </td>
                      <td style="padding:0 16px;">
                        <div style="width:1px;height:36px;background-color:rgba(255,255,255,0.2);"></div>
                      </td>
                      <td style="padding-left:16px;">
                        <img src="https://res.cloudinary.com/dv9qp6pua/image/upload/v1777223572/image-removebg-preview_wxnxqo.png"
                             alt="EDC Club REC" width="100" height="48"
                             style="height:48px;width:auto;max-width:110px;display:block;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- BADGE -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
              <tr>
                <td style="background-color:rgba(234,88,12,0.12);border:1px solid rgba(234,88,12,0.4);border-radius:20px;padding:6px 18px;">
                  <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#fb923c;letter-spacing:2.5px;text-transform:uppercase;">✦ &nbsp;Registration Confirmed&nbsp; ✦</span>
                </td>
              </tr>
            </table>

            <!-- TITLE -->
            <h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:48px;font-weight:bold;color:#ffffff;line-height:1.05;letter-spacing:-1px;margin:0 0 6px 0;">
              Startup
            </h1>
            <h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:48px;font-weight:bold;color:#f97316;line-height:1.05;letter-spacing:-1px;margin:0 0 14px 0;">
              Starter
            </h1>
            <p style="font-family:Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.55);margin:0;letter-spacing:1px;">
              Don't Learn Startup. Build One.
            </p>
          </td>
        </tr>

        <!-- ══════════ STATUS STRIP ══════════ -->
        <tr>
          <td style="background:linear-gradient(90deg,#ea580c,#f97316);padding:14px 24px;text-align:center;">
            <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;line-height:1.5;">
              <span style="display:inline-block;vertical-align:middle;">🎟</span> <span style="display:inline-block;vertical-align:middle;">YOUR QR TICKET IS READY · FULL DAY BOOTCAMP</span>
            </span>
          </td>
        </tr>

        <!-- ══════════ BODY ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:40px 40px 0 40px;">

            <!-- GREETING -->
            <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#0f1b4d;margin:0 0 10px 0;line-height:1.4;">
              Hey ${registration.name}! <span style="display:inline-block;vertical-align:middle;">👋</span>
            </h2>
            <p style="font-family:Arial,sans-serif;font-size:15px;color:#6b7280;line-height:1.7;margin:0 0 28px 0;">
              You're officially in. Your seat at <strong style="color:#0f1b4d;">Startup Starter</strong> is confirmed —
              a full-day, hands-on bootcamp where you go from zero to a pitched startup in one day.
              Here's everything you need. <span style="display:inline-block;vertical-align:middle;">🚀</span>
            </p>

            <!-- DIVIDER -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr><td style="height:1px;background:linear-gradient(90deg,#ffffff,#e5e7eb,#ffffff);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

          </td>
        </tr>

        <!-- ══════════ TICKET CARD ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:linear-gradient(145deg,#0f1b4d 0%,#1e3a8a 60%,#1e40af 100%);border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 10px 28px;text-align:center;">
                  <!-- Ticket header row -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;text-align:left;">
                        EVENT TICKET
                      </td>
                      <td style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;color:rgba(255,255,255,0.65);text-align:right;">
                        STARTUP STARTER
                      </td>
                    </tr>
                  </table>
                  <!-- QR Code -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
                    <tr>
                      <td style="background:#ffffff;border-radius:12px;padding:14px;">
                        <img src="cid:qrcode" alt="Your QR Ticket" width="200" height="200"
                             style="display:block;width:200px;height:200px;border-radius:6px;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 28px 28px;text-align:center;">
                  <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin:0 0 6px 0;">TICKET ID</p>
                  <p style="font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:bold;color:#fb923c;letter-spacing:4px;margin:0;">${registration.ticketId}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ ATTENDEE INFO ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #ebebf5;border-radius:12px;overflow:hidden;">
              <tr>
                <td width="50%" style="padding:16px 20px;border-right:1px solid #ebebf5;border-bottom:1px solid #ebebf5;">
                  <p style="font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 5px 0;">Full Name</p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;color:#0f1b4d;margin:0;">${registration.name}</p>
                </td>
                <td width="50%" style="padding:16px 20px;border-bottom:1px solid #ebebf5;">
                  <p style="font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 5px 0;">Roll No.</p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;color:#0f1b4d;margin:0;">${registration.rollNo}</p>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:16px 20px;border-right:1px solid #ebebf5;">
                  <p style="font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 5px 0;">Department</p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;color:#0f1b4d;margin:0;">${registration.department}</p>
                </td>
                <td width="50%" style="padding:16px 20px;">
                  <p style="font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 5px 0;">College</p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;color:#0f1b4d;margin:0;">${registration.college}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ IMPORTANT BOX ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:12px;">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:#92400e;margin:0 0 14px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">⚠️</span> <span style="display:inline-block;vertical-align:middle;">Must-Know Before You Arrive</span>
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="padding:7px 0;border-bottom:1px solid rgba(245,158,11,0.2);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#f59e0b;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.5;"><strong>Save this QR code</strong> — scanned at entry &amp; exit for OD eligibility</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:7px 0;border-bottom:1px solid rgba(245,158,11,0.2);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#f59e0b;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.5;"><strong>Bring your laptop</strong> — fully charged, basic software installed</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:7px 0;border-bottom:1px solid rgba(245,158,11,0.2);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#f59e0b;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.5;"><strong>QR scanned twice</strong> — morning check-in &amp; evening check-out</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:7px 0;border-bottom:1px solid rgba(245,158,11,0.2);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#f59e0b;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.5;"><strong>Complete all tasks</strong> — required for certification</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:7px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#f59e0b;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.5;"><strong>Team formation on event day</strong> — min 2 members, networking encouraged</td>
                      </tr></table>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ EVENT DETAILS + REWARDS (2 col) ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Event Details -->
                <td class="mobile-full" width="48%" valign="top"
                    style="background-color:#f4f7ff;border:1px solid #dde5f9;border-radius:12px;padding:20px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;color:#1e3a8a;margin:0 0 12px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">📅</span> <span style="display:inline-block;vertical-align:middle;">Event Details</span>
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">⏱</span> <span style="display:inline-block;vertical-align:middle;">Full Day · 8.1 Hours</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">🧑‍💻</span> <span style="display:inline-block;vertical-align:middle;">Hands-On Bootcamp</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">📍</span> <span style="display:inline-block;vertical-align:middle;">Offline · Interactive</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">🏛</span> <span style="display:inline-block;vertical-align:middle;">Venue shared soon</span></td></tr>
                  </table>
                </td>
                <td width="4%">&nbsp;</td>
                <!-- Rewards -->
                <td class="mobile-full" width="48%" valign="top"
                    style="background-color:#f4f7ff;border:1px solid #dde5f9;border-radius:12px;padding:20px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;color:#1e3a8a;margin:0 0 12px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">🏆</span> <span style="display:inline-block;vertical-align:middle;">Rewards</span>
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">🎓</span> <span style="display:inline-block;vertical-align:middle;">Certification by DPIIT &amp; Startup India</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">📋</span> <span style="display:inline-block;vertical-align:middle;">OD Credit (active attendees)</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">🚀</span> <span style="display:inline-block;vertical-align:middle;">Top teams get mentorship</span></td></tr>
                    <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#4b5563;padding:4px 0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;">🌱</span> <span style="display:inline-block;vertical-align:middle;">Incubation &amp; funding opportunities</span></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ WHAT YOU'LL BUILD ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#eef2ff;border-radius:12px;">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:#1e3a8a;margin:0 0 16px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">🎯</span> <span style="display:inline-block;vertical-align:middle;">What You'll Build in One Day</span>
                  </p>
                  <!-- Chips as table cells -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:3px 6px 3px 0;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Validated Problem Statement</span>
                      </td>
                      <td style="padding:3px 6px;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Solution Design &amp; MVP</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:3px 6px 3px 0;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Business Model</span>
                      </td>
                      <td style="padding:3px 6px;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Pitch Deck</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:3px 6px 3px 0;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Brand Identity</span>
                      </td>
                      <td style="padding:3px 6px;">
                        <span style="display:inline-block;background:#ffffff;border:1px solid #c7d6fa;border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11.5px;color:#1e40af;font-weight:bold;">✓ &nbsp;Live Shark Tank Pitch</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ BETA ACCESS ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#f0f4ff;border:1px solid #c7d6fa;border-left:4px solid #1e3a8a;border-radius:12px;">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:#1e3a8a;margin:0 0 14px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">🔐</span> <span style="display:inline-block;vertical-align:middle;">Beta Access — Premium SaaS Tools</span>
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="padding:6px 0;border-bottom:1px solid rgba(30,58,138,0.1);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e3a8a;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e40af;line-height:1.5;">As a registered attendee, you receive <strong>exclusive beta access</strong> to our premium SaaS platform</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:6px 0;border-bottom:1px solid rgba(30,58,138,0.1);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e3a8a;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e40af;line-height:1.5;">Early access credentials will be shared on the event day</td>
                      </tr></table>
                    </td></tr>
                    <tr><td style="padding:6px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e3a8a;font-weight:bold;padding-right:8px;vertical-align:top;">→</td>
                        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1e40af;line-height:1.5;">Unlock tools built for startup validation, branding &amp; pitch prep</td>
                      </tr></table>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ WHATSAPP CTA ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:linear-gradient(135deg,#0f1b4d 0%,#1e3a8a 100%);border-radius:16px;">
              <tr>
                <td style="padding:30px 28px;text-align:center;">
                  <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.65);margin:0 0 6px 0;letter-spacing:0.3px;">
                    Stay updated with venue, schedule &amp; last-minute announcements
                  </p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#ffffff;margin:0 0 20px 0;line-height:1.5;">
                    <span style="display:inline-block;vertical-align:middle;">Join the Official WhatsApp Group</span> <span style="display:inline-block;vertical-align:middle;">💬</span>
                  </p>
                  <!-- CTA BUTTON -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                    <tr>
                      <td style="background-color:#25D366;border-radius:50px;text-align:center;">
                        <a href="https://chat.whatsapp.com/Fr8RQtkjnGyGKovtqiVX68"
                           target="_blank"
                           style="display:inline-block;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;padding:14px 36px;letter-spacing:0.5px;line-height:1.5;">
                          <span style="display:inline-block;vertical-align:middle;">💬</span> <span style="display:inline-block;vertical-align:middle;">Join WhatsApp Group</span>
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin:14px 0 0 0;">
                    Venue, schedule &amp; all updates will be posted there first
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ REWARD CARDS (3 col) ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="31%" valign="top" style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #1e3a8a;border-radius:10px;padding:18px 12px;text-align:center;">
                  <p style="font-size:24px;line-height:1;margin:0 0 8px 0;"><span style="display:inline-block;vertical-align:middle;">🎓</span></p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:bold;color:#0f1b4d;margin:0 0 5px 0;">Certification</p>
                  <p style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.4;margin:0;">By DPIIT, Startup India, EDC &amp; TECHBUDDYSPACE</p>
                </td>
                <td width="4%">&nbsp;</td>
                <td width="31%" valign="top" style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #ea580c;border-radius:10px;padding:18px 12px;text-align:center;">
                  <p style="font-size:24px;line-height:1;margin:0 0 8px 0;"><span style="display:inline-block;vertical-align:middle;">💼</span></p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:bold;color:#0f1b4d;margin:0 0 5px 0;">Internship &amp; Funding</p>
                  <p style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.4;margin:0;">Internship &amp; funding opportunities</p>
                </td>
                <td width="4%">&nbsp;</td>
                <td width="31%" valign="top" style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #1e3a8a;border-radius:10px;padding:18px 12px;text-align:center;">
                  <p style="font-size:24px;line-height:1;margin:0 0 8px 0;"><span style="display:inline-block;vertical-align:middle;">🤝</span></p>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:bold;color:#0f1b4d;margin:0 0 5px 0;">Networking</p>
                  <p style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.4;margin:0;">Connect with founders &amp; mentors</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ CLOSING NOTE ══════════ -->
        <tr>
          <td class="mobile-pad" style="background-color:#ffffff;padding:24px 40px 40px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:#f9fafb;border-radius:12px;border:1px solid #f0f0f5;">
              <tr>
                <td style="padding:22px 24px;text-align:center;">
                  <p style="font-family:Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.7;margin:0;">
                    We can't wait to see what you build. Come with energy,<br>
                    curiosity, and the drive to launch something real. 🔥<br>
                    <strong style="color:#0f1b4d;">See you at Startup Starter!</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════ FOOTER ══════════ -->
        <tr>
          <td style="background-color:#0f1b4d;border-radius:0 0 20px 20px;padding:36px 40px;text-align:center;">

            <!-- Beta badge -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
              <tr>
                <td style="background-color:rgba(234,88,12,0.12);border:1px solid rgba(234,88,12,0.35);border-radius:20px;padding:5px 16px;">
                  <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#fb923c;letter-spacing:1.5px;text-transform:uppercase;">BETA ACCESS INCLUDED</span>
                </td>
              </tr>
            </table>

            <!-- Footer logos -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
              <tr>
                <td style="padding-right:14px;">
                  <img src="https://res.cloudinary.com/dv9qp6pua/image/upload/v1777223659/logo2_c78exj.png"
                       alt="TechBuddySpace" width="100" height="38"
                       style="height:38px;width:auto;max-width:110px;display:block;opacity:0.85;filter:brightness(1.2);" />
                </td>
                <td style="padding:0 14px;">
                  <div style="width:1px;height:28px;background-color:rgba(255,255,255,0.15);"></div>
                </td>
                <td style="padding-left:14px;">
                  <img src="https://res.cloudinary.com/dv9qp6pua/image/upload/v1777223572/image-removebg-preview_wxnxqo.png"
                       alt="EDC Club REC" width="90" height="42"
                       style="height:42px;width:auto;max-width:100px;display:block;opacity:0.85;filter:brightness(1.2);" />
                </td>
              </tr>
            </table>

            <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;color:rgba(255,255,255,0.7);margin:0 0 6px 0;">
              TECHBUDDYSPACE × EDC Club, REC
            </p>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.38);margin:0 0 10px 0;">
              Part of the Campus to Career Catalyst Initiative
            </p>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.38);margin:0 0 18px 0;">
              Questions? &nbsp;<a href="mailto:techbuddyspace@gmail.com" style="color:#60a5fa;text-decoration:none;">techbuddyspace@gmail.com</a>
            </p>
            <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.18);margin:0;line-height:1.7;">
              You're receiving this because you registered for Startup Starter.<br>
              &copy; 2026 TECHBUDDYSPACE Private Limited. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
      <!-- END MAIN CONTAINER -->

    </td>
  </tr>
</table>

</body>
</html>
  `;

  await transport.sendMail({
    from: `"Startup Starter - TECHBUDDYSPACE" <${process.env.EMAIL_USER}>`,
    to: registration.email,
    subject: '🎉 Your Startup Starter QR Ticket (Resent)',
    html: htmlContent,
    attachments: [
      {
        filename: 'qr-ticket.png',
        content: base64Data,
        encoding: 'base64',
        cid: 'qrcode'
      }
    ]
  });
}

