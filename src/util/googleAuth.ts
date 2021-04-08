import { google } from 'googleapis';
import { SocialAuth } from '../models';
import { isEmpty } from 'lodash';

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
  code?: string;
  oAuth2Client: any;
  oauth2: any;
  tokens: any;
  constructor(code: string = '') {
    this.oAuth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect,
    );
    this.code = code;
    this.tokens = null;
    this.oauth2 = google.oauth2('v2');

  }

  /**
   * init - Init method for login / first time authorization
   * @param {String} code - google auth code 
   */
  static init(code: string = '') {
    return (async function () {
      let googleAuth = new GoogleAuth(code)
      // Get new access token token
      await googleAuth.getNewToken(code);
      return googleAuth
    }())
  }

  /**
   * initForJob - Init method for refreshing token by job id
   * @param {String} jobId - Job id to check token in DB
   */
  static initForJob(jobId: string) {
    return (async function () {
      let googleAuth = new GoogleAuth()
      await googleAuth.refreshTokenFromDB(jobId)
      return googleAuth
    }())
  }

  async refreshTokenFromDB(jobId: string) {
    /* fetch token from db */
    const [socialAuthJob] = await SocialAuth.getSocialAuthByJobId(jobId);
    if (isEmpty(socialAuthJob)) {
      throw new Error('Refresh token is empty! Please re-connect again.')
    }
    const payloadData = {
      token_type: socialAuthJob.token_type,
      expiry_date: socialAuthJob.expiry_date,
      scope: socialAuthJob.scope,
      refresh_token: socialAuthJob.refresh_token,
      access_token: socialAuthJob.access_token,
      id_token: socialAuthJob.id_token,
    };
    this.oAuth2Client.setCredentials(payloadData);
    this.tokens = payloadData;
  }

  getNewToken(code: string) {
    return new Promise((resolve, reject) => {
      this.oAuth2Client.getToken(code, (err, tokens) => {
        if (err) {
          reject(err);
        } else {
          this.oAuth2Client.setCredentials(tokens);
          this.tokens = tokens;
          resolve(tokens)
        }
      });
    });
  }

  getTokens() {
    return this.tokens;
  }

  async getUserDetails(): Promise<{
    email: string;
    given_name: string;
    family_name: string;
  }> {
    try {
      const userInfo = await this.oauth2.userinfo.get({
        auth: this.oAuth2Client,
      });
      return userInfo.data;
    }
    catch (e) {
      throw new Error(e)
    }
  }
}
export default GoogleAuth;

/* const job = '4b36afc8-5205-49c1-af26-4bc6f96db982';
const run = async () => {
  // initForJob
  const g = await GoogleAuth.initForJob(job);
  const users = await g.getUserDetails();
  console.log('users ', users);
}
run(); */