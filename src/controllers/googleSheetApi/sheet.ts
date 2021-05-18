import { google } from 'googleapis';
import GoogleApi from '../../util/googleAuth';
import { Job } from '../../models';

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];


class SpreadSheet {
  sheet: any;
  drive: any;
  authClient: any;
  oauth2: any;
  constructor(googleClient: any) {
    this.sheet = google.sheets("v4");
    this.drive = google.drive("v3");
    this.oauth2 = google.oauth2('v2');

    this.authClient = googleClient;
  }

  async getUserDetails(): Promise<{
    email: string;
    given_name: string;
    family_name: string;
  }> {
    try {
      const userInfo = await this.oauth2.userinfo.get({
        auth: this.authClient,
      });
      return userInfo.data;
    }
    catch (e) {
      throw new Error(e)
    }
  }

  listAllSpreadSheetsFromDrive(nextPageToken?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.drive.files.list({
        pageSize: 20,
        spaces: 'drive',
        fields: 'nextPageToken, files(id, name)',
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        pageToken: nextPageToken,
        auth: this.authClient
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        const files = res.data ?? {};
        resolve(files);
      });
    })
  }
  async getSpreadSheet(spreadSheetId, range = "A1") {
    const request = {
      spreadsheetId: spreadSheetId,
      // includeGridData: true,
      auth: this.authClient,
    };
    const response = (await this.sheet.spreadsheets.get(request)).data;
    return response;
  }
  async updateSheetPermissionWithDriveApi(sheetId: string) {
    const userDetail = await this.getUserDetails()
    if (!userDetail?.email) {
      throw new Error('Email is required to update sheet permission.');
    }
    const permission = {
      type: "user",
      role: "owner",
      emailAddress: userDetail?.email,
    };
    return new Promise((resolve, reject) => {
      this.drive.permissions.create(
        {
          auth: this.authClient,
          resource: permission,
          fileId: sheetId,
          transferOwnership: true
        },
        function (err, res) {
          if (err) {
            console.error(`ERROR ADDING PERMISSION ERROR! for sheetId ${sheetId}`);
            reject(err);
          } else {
            resolve(sheetId);
          }
        }
      );
    });
  }

  async deleteSheetWithDriveApi(sheetId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.drive.files.delete(
        {
          auth: this.authClient,
          fileId: sheetId,
        },
        function (err, res) {
          if (err) {
            console.error(`ERROR:  deleting sheet ${sheetId}`);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  }

  createSheetHeading(headings) {
    const structured_heading: any = [];
    for (let [index, each] of headings.entries()) {
      structured_heading.push({
        startRow: 0, // 1st row for heading always
        startColumn: index,
        columnMetadata: [],
        rowData: [
          {
            values: [
              {
                userEnteredValue: {
                  stringValue: each,
                },
              },
            ],
          },
        ],
      });
    }
    return structured_heading;
  }

  async createSpreadsheet(title: string, headers: string[] = []): Promise<string> {
    let sheetIdToDeleteIfError = "";
    try {
      const sheetId: string = await new Promise((resolve, reject) => {
        // const structured_heading = this.createSheetHeading(
        //   headers.length > 26 ? ["heading1"] : headers
        // );
        const resource = {
          properties: {
            title,
          },
          sheets: [
            {
              data: [],
            },
            {
              properties: {
                sheetId: 0,
              },
            },
          ],
        };
        this.sheet.spreadsheets.create(
          {
            auth: this.authClient,
            resource,
          },
          (err, spreadsheet) => {
            if (err) {
              console.error(`CREATING SHEET ERROR!`);
              reject(err.stack);
            } else {
              resolve(spreadsheet?.data?.spreadsheetId);
            }
          }
        );
      });
      sheetIdToDeleteIfError = sheetId;
      // Give right access to user email
      await this.updateSheetPermissionWithDriveApi(sheetId);
      // // Update sheet with more columns if headings is greater than 25
      // if (headers.length > 26) {
      //   await this.addColumnsInSheet(sheetId, headers.length);
      // }
      return sheetId;
    } catch (e) {
      console.log("ERROR: Create new spreadsheet ", e.stack);
      if (sheetIdToDeleteIfError) {
        await this.deleteSheetWithDriveApi(sheetIdToDeleteIfError);
        console.log(
          "Sheet deleted to revert creation! ",
          sheetIdToDeleteIfError
        );
      }
      throw new Error("Sheet create error. Successfully reverted!");
    }
  }

  async appendDataToSheet(spreadsheetId, sheetRange, data) {
    return new Promise((resolve, reject) => {
      this.sheet.spreadsheets.values.append(
        {
          spreadsheetId: spreadsheetId,
          range: sheetRange,
          valueInputOption: "RAW",
          resource: {
            values: data,
          },
          auth: this.authClient,
        },
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  async clearRowsInSheet(spreadSheetId, sheetId, deleteHeading = true, headingCount = 0) {
    return new Promise((resolve, reject) => {
      this.sheet.spreadsheets.batchUpdate(
        {
          auth: this.authClient,
          spreadsheetId: spreadSheetId,
          resource: {
            requests: [{
              deleteRange: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: deleteHeading ? 0 : 1,
                },
                shiftDimension: "ROWS",
              },
            }],
          },
        },
        (err, res) => {
          if (err) {
            console.log(err.stack);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  }
  async addColumnsInSheet(sheetId, columnNumber = 26) {
    const reqPayload = {
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: columnNumber,
            },
          },
        },
      ],
    };
    return new Promise((resolve, reject) => {
      this.sheet.spreadsheets.batchUpdate(
        {
          auth: this.authClient,
          spreadsheetId: sheetId,
          resource: reqPayload,
        },
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  }

  async getValuesFromSheet(spreadsheetId, range) {
    // const appendDataRange = `${sheetData?.sheet_name}!${sheetData?.range}`;
    return new Promise((resolve, reject) => {
      this.sheet.spreadsheets.values.get({
        spreadsheetId,
        range,
        auth: this.authClient,
      }, (err, response) => {
        if (err) {
          // Handle error
          console.log(err);
          reject(err);
        } else {
          resolve(response.data?.values ?? []);
        }
      });
    });
  }
}

export default SpreadSheet;

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
