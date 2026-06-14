import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createClassicBarcode() {
  return Array.from({ length: 78 })
    .map((_, index) => {
      const width =
        index % 13 === 0 ? 4 :
        index % 7 === 0 ? 3 :
        index % 3 === 0 ? 2 : 1;

      return `<span style="display:inline-block;width:${width}px;height:72px;background:#050505;margin:0 1px;"></span>`;
    })
    .join("");
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      flight,
      from,
      to,
      seat,
      gate,
      terminal,
      boardingId,
    } = body;

    const safeFullName = escapeHtml(fullName || "Passenger");
    const safeEmail = escapeHtml(email || "");
    const safeFlight = escapeHtml(flight || "OM 1025");
    const safeFrom = escapeHtml(from || "SKG");
    const safeTo = escapeHtml(to || "???");
    const safeSeat = escapeHtml(seat || "TBA");
    const safeGate = escapeHtml(gate || "TBA");
    const safeTerminal = escapeHtml(terminal || "TBA");
    const safeBoardingId = escapeHtml(boardingId || "OMMT-PASS");
    const firstName = escapeHtml(fullName?.split(" ")?.[0] || "Passenger");
    const barcodeBars = createClassicBarcode();

    const response = await resend.emails.send({
      from: "OMMT Airlines <boarding@ommtairlines.site>",
      to: safeEmail,
      subject: `Your OMMT Boarding Pass • ${safeFlight}`,
      html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#02050c;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your digital boarding pass for Philoxenia 2026 — Marketing Made in Greece | On Air is ready.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#02050c;">
      <tr>
        <td align="center" style="padding:36px 14px;background:radial-gradient(circle at 50% 0%,#17304d 0%,#071321 38%,#02050c 78%);">

          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <div style="font-size:12px;letter-spacing:7px;color:#d7a247;text-transform:uppercase;font-weight:700;">
                  OMMT Airlines
                </div>
                <div style="margin-top:12px;font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.42);text-transform:uppercase;">
                  Digital Aviation Experience
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 0 22px 0;">
                <div style="border:1px solid rgba(215,162,71,0.28);border-radius:34px;background:linear-gradient(145deg,rgba(49,50,52,0.96),rgba(13,18,26,0.98) 62%,rgba(1,4,11,0.98));overflow:hidden;box-shadow:0 34px 90px rgba(0,0,0,0.62);">

                  <div style="padding:32px 24px 30px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <div style="font-size:10px;letter-spacing:5px;color:#d7a247;text-transform:uppercase;">
                            Boarding Pass
                          </div>
                        </td>
                        <td align="right">
                          <div style="font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.42);text-transform:uppercase;">
                            OMMT / 1025
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:42px;">
                      <tr>
                        <td width="38%" align="left" valign="top">
                          <div style="font-size:50px;font-weight:800;letter-spacing:4px;line-height:1;color:#ffffff;">
                            ${safeFrom}
                          </div>
                          <div style="margin-top:16px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.46);text-transform:uppercase;">
                            Thessaloniki
                          </div>
                        </td>

        

                        <td width="38%" align="right" valign="top">
                          <div style="font-size:50px;font-weight:800;letter-spacing:4px;line-height:1;color:#ffffff;">
                            ${safeTo}
                          </div>
                          <div style="margin-top:16px;font-size:10px;letter-spacing:4px;line-height:1.6;color:rgba(255,255,255,0.46);text-transform:uppercase;">
                            Secret<br/>Destination
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);margin:38px 0 30px 0;"></div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-bottom:25px;">
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Passenger</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;letter-spacing:2px;color:#ffffff;text-transform:uppercase;">${safeFullName}</div>
                        </td>
                        <td width="50%" style="padding-bottom:25px;">
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Flight</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;letter-spacing:2px;color:#ffffff;">${safeFlight}</div>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-bottom:25px;">
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Terminal</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;color:#ffffff;">${safeTerminal}</div>
                        </td>
                        <td style="padding-bottom:25px;">
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Gate</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;color:#ffffff;">${safeGate}</div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Seat</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;color:#ffffff;">${safeSeat}</div>
                        </td>
                        <td>
                          <div style="font-size:10px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">Boarding ID</div>
                          <div style="margin-top:10px;font-size:15px;font-weight:800;color:#ffffff;">${safeBoardingId}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);margin:38px 0 30px 0;"></div>

                    <div style="font-size:27px;line-height:1.45;letter-spacing:6px;font-weight:300;color:#ffffff;text-transform:uppercase;">
                      Your Journey<br/>
                      Starts <span style="color:#d7a247;">Here.</span>
                    </div>
                  </div>

                  <div style="background:#01040b;padding:28px 24px 30px 24px;border-top:1px solid rgba(215,162,71,0.16);">
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td align="left" style="font-size:9px;letter-spacing:4px;color:#d7a247;text-transform:uppercase;">
                          Digital Boarding ID
                        </td>
                        <td align="right" style="font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.42);">
                          ${safeBoardingId}
                        </td>
                      </tr>
                    </table>

                    <div style="background:#f7f7f2;border-radius:18px;text-align:center;padding:18px 10px 16px 10px;">
                      <div style="font-size:0;line-height:0;white-space:nowrap;overflow:hidden;">
                        ${barcodeBars}
                      </div>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                      <tr>
                        <td align="left" style="font-size:8px;letter-spacing:4px;color:rgba(255,255,255,0.38);text-transform:uppercase;">
                          SEQ 00025
                        </td>
                        <td align="right" style="font-size:8px;letter-spacing:4px;color:rgba(255,255,255,0.38);text-transform:uppercase;">
                          OMMT Secure Pass
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 10px 0 10px;text-align:left;">
                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.88);margin:0 0 18px 0;">
                  Αγαπητέ/ή <span style="color:#d7a247;">${firstName}</span>,
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 18px 0;">
                  Σας καλωσορίζουμε στην εμπειρία <span style="color:#ffffff;">Philoxenia 2026 — Marketing Made in Greece | On Air.</span>
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 18px 0;">
                  Η προσωπική σας κάρτα επιβίβασης επιβεβαιώνει την πρόσβασή σας στην εκδήλωση και ενεργοποιεί τη συμμετοχή σας στο <span style="color:#ffffff;">Secret Destination Giveaway Experience.</span>
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 26px 0;">
                  Παρακαλούμε διατηρήστε το boarding pass διαθέσιμο μέχρι την ολοκλήρωση της εκδήλωσης και της επίσημης διαδικασίας κλήρωσης.
                </p>

                <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(215,162,71,0.35),transparent);margin:32px 0;"></div>

                <p style="
  font-size:22px;
  line-height:1.4;
  letter-spacing:2.5px;
  color:#ffffff;
  font-weight:300;
  margin:0 0 26px 0;
">
  <span style="white-space:nowrap;">
    OMMTo<span style="color:#d7a247;">...</span>New horizons
  </span>
</p>


                <p style="
  font-size:11px;
  line-height:2.1;
  color:rgba(255,255,255,0.34);
  margin:0;
  letter-spacing:0.4px;
  font-weight:300;
">
  Με εκτίμηση,<br/><br/>

  <span style="
    color:rgba(255,255,255,0.62);
    letter-spacing:2.5px;
    text-transform:uppercase;
    font-size:11px;
  ">
    OMMT Airlines
  </span>

  <br/><br/>

  Department of Organisation Management, Marketing and Tourism<br/>
  School of Economics and Business Administration<br/>
  International Hellenic University
</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:34px 18px 10px 18px;">
                <div style="
  font-size:11px;
  letter-spacing:3.5px;
  color:rgba(215,162,71,0.55);
  text-transform:uppercase;
  font-weight:500;
">
  AVIATION. TOURISM. INNOVATION.
</div>


                <div style="margin-top:20px;font-size:9px;line-height:1.8;color:rgba(255,255,255,0.24);text-align:left;max-width:340px;">
                  Passenger Information & Privacy Protocol<br/><br/>
                  Η επεξεργασία των προσωπικών δεδομένων πραγματοποιείται αποκλειστικά για λειτουργικούς και οργανωτικούς σκοπούς της εμπειρίας check-in και της συμμετοχής στην εκδήλωση, σύμφωνα με τις αρχές του GDPR (EU 2016/679).
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
      `,
      text: `Your OMMT Boarding Pass is ready.

Passenger: ${safeFullName}
Flight: ${safeFlight}
From: ${safeFrom}
To: ${safeTo}
Seat: ${safeSeat}
Gate: ${safeGate}
Terminal: ${safeTerminal}
Boarding ID: ${safeBoardingId}

Philoxenia 2026 — Marketing Made in Greece | On Air
OMMT Airlines`,
    });

    return Response.json({
      success: true,
      response,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
