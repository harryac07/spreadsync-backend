import { google } from 'googleapis';

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];


class SpreadSheet {
  constructor() {
    this.sheet = google.sheets("v4");
    this.drive = google.drive("v3");
    this.jwtClient = this.authorize();
  }
  authorize() {
    const jwtClient = new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      SCOPES
    );
    jwtClient.authorize(function (err, token) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully connected! ");
      }
    });
    return jwtClient;
  }

  //   async getSpreadSheet(spreadSheetId, ranges = "A1:B1") {
  //     const request = {
  //       spreadsheetId: spreadSheetId,
  //       includeGridData: true, // TODO: Update placeholder value.
  //       auth: this.jwtClient,
  //       ranges: ranges,
  //     };
  //     const response = (await this.sheet.spreadsheets.get(request)).data;
  //     return response;
  //   }
  //   async updateSheetPermissionWithDriveApi(sheetId) {
  //     const permission = {
  //       type: "user",
  //       role: "writer",
  //       emailAddress: process.env.email,
  //     };
  //     return new Promise((resolve, reject) => {
  //       this.drive.permissions.create(
  //         {
  //           auth: this.jwtClient,
  //           resource: permission,
  //           fileId: sheetId,
  //         },
  //         function(err, res) {
  //           if (err) {
  //             console.error(`ADDING PERMISSION ERROR! for sheetId ${sheetId}`);
  //             reject(err);
  //           } else {
  //             resolve(sheetId);
  //           }
  //         }
  //       );
  //     });
  //   }

  //   async deleteSheetWithDriveApi(sheetId) {
  //     return new Promise((resolve, reject) => {
  //       this.drive.files.delete(
  //         {
  //           auth: this.jwtClient,
  //           fileId: sheetId,
  //         },
  //         function(err, res) {
  //           if (err) {
  //             console.error(`DELETE sheet ${sheetId}`);
  //             reject(err);
  //           } else {
  //             resolve(res);
  //           }
  //         }
  //       );
  //     });
  //   }

  //   createSheetHeading(headings) {
  //     const structured_heading = [];
  //     for (let [index, each] of headings.entries()) {
  //       structured_heading.push({
  //         startRow: 0, // 1st row for heading always
  //         startColumn: index,
  //         columnMetadata: [],
  //         rowData: [
  //           {
  //             values: [
  //               {
  //                 userEnteredValue: {
  //                   stringValue: each,
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       });
  //     }
  //     return structured_heading;
  //   }

  //   async createSpreadsheet(title = "qt-cadencer-datastudio", headers = []) {
  //     let sheetIdToDeleteIfError = "";
  //     try {
  //       const sheetId = await new Promise((resolve, reject) => {
  //         const structured_heading = this.createSheetHeading(
  //           headers.length > 26 ? ["heading1"] : headers
  //         );
  //         const resource = {
  //           properties: {
  //             title,
  //           },
  //           sheets: [
  //             {
  //               data: structured_heading,
  //             },
  //             {
  //               properties: {
  //                 sheetId: 0,
  //               },
  //             },
  //           ],
  //         };
  //         this.sheet.spreadsheets.create(
  //           {
  //             auth: this.jwtClient,
  //             resource,
  //           },
  //           (err, spreadsheet) => {
  //             if (err) {
  //               console.error(`CREATING SHEET ERROR!`);
  //               reject(err.stack);
  //             } else {
  //               resolve(spreadsheet.data.spreadsheetId);
  //             }
  //           }
  //         );
  //       });
  //       sheetIdToDeleteIfError = sheetId;
  //       // Give right access to user email
  //       await this.updateSheetPermissionWithDriveApi(sheetId);
  //       // Update sheet with more columns numbers if headings is greater than 25
  //       if (headers.length > 26) {
  //         await this.addColumnNumber(sheetId, headers.length);
  //       }
  //       return sheetId;
  //     } catch (e) {
  //       console.log("ERROR ", e.stack);
  //       if (sheetIdToDeleteIfError) {
  //         this.deleteSheetWithDriveApi(sheetIdToDeleteIfError);
  //         console.log(
  //           "Sheet deleted to revert creation! ",
  //           sheetIdToDeleteIfError
  //         );
  //         throw new Error("Sheet create error");
  //       }
  //     }
  //   }

  //   async appendDataToSheet(sheetId, data) {
  //     return new Promise((resolve, reject) => {
  //       this.sheet.spreadsheets.values.append(
  //         {
  //           spreadsheetId: sheetId,
  //           range: "Sheet1",
  //           valueInputOption: "RAW",
  //           resource: {
  //             values: data,
  //           },
  //           auth: this.jwtClient,
  //         },
  //         (err, result) => {
  //           if (err) {
  //             console.log(err);
  //             reject(err);
  //           } else {
  //             resolve(result);
  //           }
  //         }
  //       );
  //     });
  //   }

  //   async clearRowsInSheet(sheetId, deleteHeading = false, headingCount = 0) {
  //     const sheetData = await this.getSpreadSheet(sheetId);
  //     const sheets = sheetData.sheets;
  //     const requestPayload = [];
  //     for (let sheet of sheets) {
  //       requestPayload.push(
  //         {
  //           deleteRange: {
  //             range: {
  //               sheetId: sheet.properties.sheetId, // gid
  //               startRowIndex: deleteHeading ? 0 : 1,
  //             },
  //             shiftDimension: "ROWS",
  //           },
  //         },
  //         {
  //           deleteDimension: {
  //             range: {
  //               sheetId: sheet.properties.sheetId,
  //               dimension: "COLUMNS",
  //               startIndex: headingCount - 1,
  //             },
  //           },
  //         }
  //       );
  //     }
  //     if (requestPayload.length === 0) {
  //       throw new Error("No sheet grid id to clear sheet");
  //     }
  //     return new Promise((resolve, reject) => {
  //       this.sheet.spreadsheets.batchUpdate(
  //         {
  //           auth: this.jwtClient,
  //           spreadsheetId: sheetId,
  //           resource: {
  //             requests: requestPayload,
  //           },
  //         },
  //         (err, res) => {
  //           if (err) {
  //             console.log(err.stack);
  //             reject(err);
  //           } else {
  //             resolve(res);
  //           }
  //         }
  //       );
  //     });
  //   }
  //   async addColumnNumber(sheetId, columnNumber = 26) {
  //     const reqPayload = {
  //       requests: [
  //         {
  //           autoResizeDimensions: {
  //             dimensions: {
  //               sheetId: 0,
  //               dimension: "COLUMNS",
  //               startIndex: 0,
  //               endIndex: columnNumber,
  //             },
  //           },
  //         },
  //       ],
  //     };
  //     return new Promise((resolve, reject) => {
  //       this.sheet.spreadsheets.batchUpdate(
  //         {
  //           auth: this.jwtClient,
  //           spreadsheetId: sheetId,
  //           resource: reqPayload,
  //         },
  //         (err, res) => {
  //           if (err) {
  //             reject(err);
  //           } else {
  //             resolve(res);
  //           }
  //         }
  //       );
  //     });
  //   }
}

module.exports = SpreadSheet;

// h.createSpreadsheet("qt-cadencer-datastudio", ["email", "business_id", "city"])
// 	.then(data => {
// 		console.log(data);
// 	}).catch(e => {
// 		console.log(e)
// 	})

// h.updateSheetPermissionWithDriveApi('1jQrqZsfp3DVYlNrr6z98wqIthlXCF5Qo_atgszwUEQk')
//     .then(res => {
//         console.log('ok ', res)
//     }).catch(e => {
//         console.log('error ', e)
//     })

// h.clearRowsInSheet('1jQrqZsfp3DVYlNrr6z98wqIthlXCF5Qo_atgszwUEQk')
// 	.then(data => {
// 		console.log(data)
// 	}).catch(e => {
// 		console.log(e)
// 	})
// const sheetApi = new SpreadSheet()
// sheetApi.deleteSheetWithDriveApi('1R4C5uVZqVb3fFSylOQUW4-hwmWRt2bEsy8CJE76qCX4')
// 	.then(data => {
// 		console.log(data.sheets)
// 	}).catch(e => {
// 		console.log(e)
// 	})
