import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const firstName = fullName?.split(" ")?.[0] || fullName || "Passenger";

    const barcodeBars = Array.from({ length: 44 })
      .map((_, index) => {
        const width =
          index % 7 === 0 ? 4 : index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1;
        const height = 28 + ((index * 19) % 40);
        const opacity = index % 5 === 0 ? 0.95 : 0.68;

        return `<span style="display:inline-block;width:${width}px;height:${height}px;background:#d7a247;margin:0 2px;opacity:${opacity};vertical-align:bottom;"></span>`;
      })
      .join("");

    const response = await resend.emails.send({
      from: "OMMT Airlines <onboarding@resend.dev>",
      to: email,
      subject: `Your OMMT Boarding Pass • ${flight}`,
      html: `
        <div style="margin:0;padding:0;background:#02050c;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
          <div style="padding:34px 10px;background:radial-gradient(circle at 50% 0%,#10233c 0%,#02050c 48%,#010309 100%);">

            <div style="max-width:420px;margin:0 auto;text-align:center;">
              <div style="margin-bottom:28px;">
                <div style="font-size:11px;letter-spacing:6px;color:#d7a247;text-transform:uppercase;">
                  OMMT Airlines
                </div>
                <div style="margin-top:12px;font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.36);text-transform:uppercase;">
                  Digital Aviation Experience
                </div>
              </div>

              <div style="border:1px solid rgba(215,162,71,0.28);border-radius:32px;background:linear-gradient(180deg,rgba(10,27,49,0.98),rgba(2,5,12,0.98));overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.55);text-align:left;">

                <div style="padding:34px 24px 32px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="left">
                        <div style="color:#d7a247;font-size:9px;letter-spacing:4px;text-transform:uppercase;">
                          Boarding Pass
                        </div>
                      </td>
                      <td align="right">
                        <div style="color:rgba(255,255,255,0.38);font-size:9px;letter-spacing:3px;text-transform:uppercase;">
                          OMMT / 1025
                        </div>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:38px;">
                    <tr>
                      <td width="40%" align="left">
                        <div style="font-size:46px;font-weight:700;letter-spacing:5px;line-height:1;color:#ffffff;">
                          ${from}
                        </div>
                        <div style="margin-top:12px;color:rgba(255,255,255,0.48);font-size:9px;letter-spacing:3px;text-transform:uppercase;">
                          Thessaloniki
                        </div>
                      </td>

                      <td width="20%" align="center">

  <div style="
    width:48px;
    height:48px;
    border-radius:50%;
    border:1px solid rgba(215,162,71,0.45);
    background:rgba(215,162,71,0.08);
    color:#d7a247;
    font-size:24px;
    line-height:48px;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
  ">
    &#9992;
  </div>

</td>

                      <td width="40%" align="right">
                        <div style="font-size:46px;font-weight:700;letter-spacing:5px;line-height:1;color:#ffffff;">
                          ${to}
                        </div>
                        <div style="margin-top:12px;color:rgba(255,255,255,0.48);font-size:9px;letter-spacing:3px;text-transform:uppercase;">
                          Secret Destination
                        </div>
                      </td>
                    </tr>
                  </table>

                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent);margin:34px 0;"></div>

                  <table width="100%" cellpadding="0" cellspacing="0" style="color:#ffffff;">
                    <tr>
                      <td width="50%" style="padding-bottom:24px;">
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Passenger</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;letter-spacing:1px;">${fullName}</div>
                      </td>
                      <td width="50%" style="padding-bottom:24px;">
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Flight</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;letter-spacing:1px;">${flight}</div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:24px;">
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Terminal</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;">${terminal}</div>
                      </td>
                      <td style="padding-bottom:24px;">
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Gate</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;">${gate}</div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Seat</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;">${seat}</div>
                      </td>
                      <td>
                        <div style="color:#d7a247;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Boarding ID</div>
                        <div style="margin-top:8px;font-size:14px;font-weight:700;">${boardingId}</div>
                      </td>
                    </tr>
                  </table>

                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent);margin:34px 0;"></div>

                  <div style="font-size:24px;line-height:1.4;font-weight:300;letter-spacing:5px;color:#ffffff;">
                    YOUR JOURNEY<br/>
                    STARTS <span style="color:#d7a247;">HERE.</span>
                  </div>
                </div>

                <div style="background:#01040b;padding:28px 24px;border-top:1px solid rgba(215,162,71,0.16);">
                  <div style="height:74px;border-radius:18px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);text-align:center;padding-top:22px;">
                    <div style="font-size:0;line-height:0;">
                      ${barcodeBars}
                    </div>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                    <tr>
                      <td align="left" style="color:rgba(255,255,255,0.38);font-size:8px;letter-spacing:3px;text-transform:uppercase;">
                        SEQ 00025
                      </td>
                      <td align="right" style="color:rgba(255,255,255,0.38);font-size:8px;letter-spacing:3px;text-transform:uppercase;">
                        OMMT Secure Pass
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <div style="max-width:400px;margin:36px auto 0 auto;text-align:left;">
                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.84);margin:0 0 22px 0;">
                  Αγαπητέ/ή <span style="color:#d7a247;">${firstName}</span>,
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 22px 0;">
                  Σας καλωσορίζουμε στην εμπειρία <span style="color:#ffffff;">Philoxenia 2026 — Marketing Made in Greece | On Air.</span>
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 22px 0;">
                  Η διαδικασία check-in ολοκληρώθηκε επιτυχώς και η προσωπική σας κάρτα επιβίβασης περιλαμβάνεται στο παρόν email.
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 22px 0;">
                  Το boarding pass περιλαμβάνει το μοναδικό σας <span style="color:#d7a247;">Boarding ID</span> και αποτελεί το επίσημο προσωπικό σας pass εισόδου στην εκδήλωση, καθώς και τη συμμετοχή σας στο <span style="color:#ffffff;">Secret Destination Giveaway Experience.</span>
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 22px 0;">
                  Η συγκεκριμένη πρωτοβουλία σχεδιάστηκε ως μία βιωματική εμπειρία εμπνευσμένη από το περιβάλλον της αεροπορίας, με στόχο τη σύνδεση του branding, της φιλοξενίας και της συναισθηματικής αλληλεπίδρασης μέσα από ένα immersive event concept.
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 22px 0;">
                  Κάθε κάρτα επιβίβασης αντιστοιχεί σε μία μοναδική συμμετοχή και ενεργοποιεί την πρόσβασή σας στη συνολική εμπειρία της διοργάνωσης.
                </p>

                <p style="font-size:15px;line-height:1.9;color:rgba(255,255,255,0.72);margin:0 0 34px 0;">
                  Παρακαλούμε να διατηρήσετε το boarding pass διαθέσιμο μέχρι την ολοκλήρωση της εκδήλωσης και της επίσημης διαδικασίας κλήρωσης.
                </p>

                <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(215,162,71,0.35),transparent);margin:34px 0;"></div>

                <p style="font-size:21px;line-height:1.6;letter-spacing:3px;color:#ffffff;font-weight:300;text-transform:uppercase;margin:0 0 30px 0;">
                  Some journeys begin<br/>
                  long before departure.
                </p>

                <p style="font-size:14px;line-height:2;color:rgba(255,255,255,0.46);margin:0;">
                  Με εκτίμηση,<br/>
                  OMMT Airlines<br/><br/>
                  Department of Organisation Management, Marketing and Tourism<br/>
                  School of Economics and Management<br/>
                  International Hellenic University
                </p>
              </div>

              <div style="
  margin-top:34px;
  color:rgba(255,255,255,0.36);
  font-size:10px;
  letter-spacing:2px;
  text-transform:none;
  font-weight:500;
">
  OMMTo...New Horizons
</div>

<div style="
  margin-top:18px;
  font-size:8px;
  line-height:1.7;
  color:rgba(255,255,255,0.22);
  text-align:right;
  max-width:300px;
  margin-left:auto;
">
  Passenger Information & Privacy Protocol<br/><br/>

  Η επεξεργασία των προσωπικών δεδομένων πραγματοποιείται αποκλειστικά για λειτουργικούς και οργανωτικούς σκοπούς της εμπειρίας check-in και της συμμετοχής στην εκδήλωση, σύμφωνα με τις αρχές του GDPR (EU 2016/679).
</div>

</div>

</div>

</div>

</div>
      `,
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
