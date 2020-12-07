import { google } from 'googleapis';

const googleConfig = {
  clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URL,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const defaultSpreadsheetScope = [
//   'openid',
//   'profile',
//   'email',
//   'https://www.googleapis.com/auth/drive.file',
//   'https://www.googleapis.com/auth/spreadsheets',
// ];

class GoogleAuth {
  code: string;
  oAuth2Client: any;
  oauth2: any;
  tokens: null | string;
  constructor(code) {
    this.code = code;
    this.oAuth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect,
    );
    this.oauth2 = google.oauth2('v2');
    this.tokens = null;
  }

  getAccessToken() {
    return new Promise((resolve, reject) => {
      this.oAuth2Client.getToken(this.code, (err, tokens) => {
        if (err) {
          reject(err);
        } else {
          this.oAuth2Client.setCredentials(tokens);
          this.tokens = tokens;
          resolve(tokens);
        }
      });
    });
  }

  async getUserDetails() {
    if (!this.tokens) {
      throw new Error('Access token not found!');
    }
    const userInfo = await this.oauth2.userinfo.get({
      auth: this.oAuth2Client,
    });
    return userInfo.data;
  }

  authorizeSpreadsheet() {
    // defaultSpreadsheetScope
  }
}
export default GoogleAuth;
