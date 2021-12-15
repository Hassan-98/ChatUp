module.exports = ({ username, verifyLink }) => `
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
        <tr>
          <td align="center" style="padding:10px 0 0;background:#1E3750;">
            <img src="https://chatupapp.tk/imgs/chatLogoNothing-Dark.png" alt="" width="80" style="height:auto;display:block;" />
            <h2 style="font-family:Arial,sans-serif;color: #fff;margin-top:5px">ChatUp</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 30px 42px 30px;">
            <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
              <tr>
                <td style="color:#153643;">
                  <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;direction:ltr">Reset your password ?</h1>
                  <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;direction:ltr">If you requested a password reset for ${username}, use the link below to complete the process. If you didn't make this request, ignore this email.</p>
                  <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="${verifyLink}" style="color:#ee4c50;text-decoration:underline;direction:ltr">Reset Password</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:30px;background:#ee4c50;">
            <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
              <tr>
                <td style="padding:0;width:50%;" align="left">
                  <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;direction:ltr">
                    &reg; Hassan Ali, ChatUp 2021
                  </p>
                </td>
                <td style="padding:0;width:50%;" align="right">
                  <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                    <tr>
                      <td style="padding:0 0 0 10px;width:38px;">
                        <a href="http://chatupapp.tk/" style="color:#ffffff;"><img src="https://chatupapp.tk/imgs/chatLogoWhite.png" alt="ChatUp" width="38" style="height:auto;display:block;border:0;" /></a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
