import jwt from 'jsonwebtoken';
import { sendEmail } from './nodemailer';

const appUrl = 'http://localhost:3000';
/**
 * sendInvitationEmailToUser
 * @param {Object}payload
 * @param {String}payload.email - email to sent invitation to
 * @param {String}payload.project invitation project
 * @param {String}payload.token - token to include user and project information
 * */
const sendInvitationEmailToUser = async ({ email, project, token }) => {
  const subject = `You are invited to the project ${project}`;
  const body = `
  <html>
    <head>
      <style>
          font-family: Arial, sans-serif;
          .button {
            background: #3A3C67;
            padding: 20px;
            text-align: center;
          }
          .contact_us{
            color: #7ED7DA;
          }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h3>Greetings from Spreadsync!</h3>
            <p>
              You are invited to the spreadsync project: <b>${project}</b>. 
            </p>
            <p>
              All you need to do is <a class="button" type="button" href='${appUrl}/signup?token=${token}'>accept invitation</a> to get started.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <b>Spreadsync Team</b>
            <p>
              <i>Please <a class="contact_us" href="mailto:${process.env.EMAIL_SENDER_ACCOUNT}">contact us</a> for any questions you may have.</i>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  await sendEmail({ email, subject, body });
};

/**
 * notifyUserForProjectInvitation
 * @param {Object}payload
 * @param {String}payload.email - email to sent invitation to
 * @param {String}payload.project invitation project
 * */
const notifyUserForProjectInvitation = async ({ email, project }) => {
  console.log(`Email sent to: ${email} for project: ${project}`);
  const subject = `You are invited to the project ${project}`;
  const body = `
  <html>
    <head>
      <style>
          font-family: Arial, sans-serif;
          .button {
            background: #3A3C67;
            padding: 20px;
            text-align: center;
          }
          .contact_us{
            color: #7ED7DA;
          }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h3>Greetings from Spreadsync!</h3>
            <p>
              You are invited to the spreadsync project: <b>${project}</b>. You can now view the added projects under the respective account.
            </p>
            <p>
              Note: <i>You can switch between multiple accounts to view added projects.</i>
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <b>Spreadsync Team</b>
            <p>
              <i>Please <a class="contact_us" href="mailto:${process.env.EMAIL_SENDER_ACCOUNT}">contact us</a> for any questions you may have.</i>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  await sendEmail({ email, subject, body });
};

/**
 * notifyUserForAccountOwnershipInvitation
 * @param {Object}payload
 * @param {String}payload.email - email to sent invitation to
 * @param {String}payload.accountName - account name user is invited to
 * @param {String}payload.extraText - Extra text if you would like to add
 * */
const notifyUserForAccountOwnershipInvitation = async ({ email, accountName, extraText = "" }) => {
  const subject = `You are made an owner of the account ${accountName}`;
  const body = `
  <html>
    <head>
      <style>
          font-family: Arial, sans-serif;
          .button {
            background: #3A3C67;
            padding: 20px;
            text-align: center;
          }
          .contact_us{
            color: #7ED7DA;
          }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h3>Greetings from Spreadsync!</h3>
            <p>
              You are made an owner of the account: <b>${accountName}</b>. You have full control over the account.
            </p>
            <p>
              You can switch between multiple accounts from the top right corner in the app.
            </p>
            ${extraText ? extraText : ''}
          </td>
        </tr>
        <tr>
          <td>
            <b>Spreadsync Team</b>
            <p>
              <i>Please <a class="contact_us" href="mailto:${process.env.EMAIL_SENDER_ACCOUNT}">contact us</a> for any questions you may have.</i>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  await sendEmail({ email, subject, body });
};

/**
 * sendAccountOwnershipInvitationEmailToUser
 * @param {Object}payload
 * @param {String}payload.email - email to sent invitation to
 * @param {String}payload.accountName -  ownership invitation to the account
 * @param {String}payload.token - token to include user and account information
 * */
const sendAccountOwnershipInvitationEmailToUser = async ({ email, accountName, token }) => {
  const subject = `You are invited to the account ${accountName}`;
  const body = `
  <html>
    <head>
      <style>
          font-family: Arial, sans-serif;
          .button {
            background: #3A3C67;
            padding: 20px;
            text-align: center;
          }
          .contact_us{
            color: #7ED7DA;
          }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h3>Greetings from Spreadsync!</h3>
            <p>
              You are invited to the account: <b>${accountName}</b>. 
            </p>
            <p>
              All you need to do is <a class="button" type="button" href='${appUrl}/signup?token=${token}'>accept invitation</a> to get started.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <b>Spreadsync Team</b>
            <p>
              <i>Please <a class="contact_us" href="mailto:${process.env.EMAIL_SENDER_ACCOUNT}">contact us</a> for any questions you may have.</i>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  await sendEmail({ email, subject, body });
};

/**
 * sendEmailConfirmationEmail
 * @param {Object}payload
 * @param {String}payload.email - email to sent invitation to
 * @param {String}payload.firstname - user firstname
 * @param {String}payload.token - token to include user and project information
 * */
const sendEmailConfirmationEmail = async ({ email, firstname, token }) => {
  const subject = `Confirm your email to access your Spreadsync account`;
  const body = `
  <html>
    <head>
      <style>
          font-family: Arial, sans-serif;
          .btn-confirm {
            background: #3A3C67;
            padding: 20px;
            text-align: center;
            color: #fff;
          }
          .contact_us{
            color: #7ED7DA;
          }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h3>Hello ${firstname},</h3>
            <p>
              Thank you for being part of Spreadsync! Now, just one more step to go.
            </p>
            <p>
              Please select the confirm button to verify your email account.
            </p>
            <p>
              <a type="button" class="btn-confirm"  href='${appUrl}/confirmation?token=${token}'>Confirm</a>
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <b>Spreadsync Team</b>
            <p>
              <i>Please <a class="contact_us" href="mailto:${process.env.EMAIL_SENDER_ACCOUNT}">contact us</a> for any questions you may have.</i>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  await sendEmail({ email, subject, body });
};

/**
 * generateInvitationToken
 * @param {Object}payload - payload to include in generated token
 * */
const generateInvitationToken = (payload: any): any => {
  /* using different jwt secret than normal login flow for security concern */
  const token = jwt.sign(payload, process.env.INVITATION_JWT_SECRET as jwt.Secret);
  return token;
};

export {
  sendInvitationEmailToUser,
  notifyUserForProjectInvitation,
  notifyUserForAccountOwnershipInvitation,
  sendEmailConfirmationEmail,
  sendAccountOwnershipInvitationEmailToUser,
  generateInvitationToken,
};
