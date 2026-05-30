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

    const response = await resend.emails.send({
      from: "OMMT Airlines <onboarding@resend.dev>",
      to: email,
      subject: `Your OMMT Boarding Pass • ${flight}`,
      html: `
        <div style="
          background:#02050c;
          padding:40px;
          font-family:Arial,sans-serif;
          color:white;
        ">
          <div style="
            max-width:560px;
            margin:auto;
            border:1px solid rgba(215,162,71,0.25);
            border-radius:28px;
            overflow:hidden;
            background:linear-gradient(
              135deg,
              #0d1f36 0%,
              #030814 100%
            );
          ">
            
            <div style="padding:40px;">
              
              <p style="
                color:#d7a247;
                letter-spacing:4px;
                font-size:11px;
                text-transform:uppercase;
              ">
                Boarding Pass
              </p>

              <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-top:30px;
              ">
                <div>
                  <div style="
                    font-size:56px;
                    font-weight:700;
                  ">
                    ${from}
                  </div>

                  <div style="
                    opacity:0.6;
                    letter-spacing:3px;
                    margin-top:8px;
                    font-size:11px;
                  ">
                    THESSALONIKI
                  </div>
                </div>

                <div style="
                  color:#d7a247;
                  font-size:30px;
                ">
                  ✈
                </div>

                <div style="text-align:right;">
                  <div style="
                    font-size:56px;
                    font-weight:700;
                  ">
                    ${to}
                  </div>

                  <div style="
                    opacity:0.6;
                    letter-spacing:3px;
                    margin-top:8px;
                    font-size:11px;
                  ">
                    SECRET DESTINATION
                  </div>
                </div>
              </div>

              <div style="
                border-top:1px solid rgba(255,255,255,0.1);
                margin:32px 0;
              "></div>

              <table width="100%" style="color:white;">
                <tr>
                  <td style="padding-bottom:22px;">
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      PASSENGER
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${fullName}
                    </div>
                  </td>

                  <td style="padding-bottom:22px;">
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      FLIGHT
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${flight}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:22px;">
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      TERMINAL
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${terminal}
                    </div>
                  </td>

                  <td style="padding-bottom:22px;">
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      GATE
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${gate}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      SEAT
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${seat}
                    </div>
                  </td>

                  <td>
                    <div style="color:#d7a247;font-size:10px;letter-spacing:3px;">
                      BOARDING ID
                    </div>
                    <div style="margin-top:6px;font-weight:700;">
                      ${boardingId}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="
                border-top:1px solid rgba(255,255,255,0.1);
                margin:34px 0;
              "></div>

              <div style="
                font-size:32px;
                line-height:1.3;
                letter-spacing:4px;
              ">
                YOUR JOURNEY<br/>
                STARTS <span style="color:#d7a247;">HERE.</span>
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
