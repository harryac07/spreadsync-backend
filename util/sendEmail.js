/**
 * sendEmail
 * @param {String}emailList - Array of emails
 * */
const sendEmailToUsers = async (emailList = [], projectId) => {
  /* Will be replace with proper email sending mechanisms */
  for (let each of emailList) {
    console.log(`Email sent to: ${each} for project: ${projectId}`);
  }
};

module.exports = {
  sendEmailToUsers,
};
