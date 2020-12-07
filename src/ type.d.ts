declare namespace Express {
  export interface Request {
    locals: any;
    status: number;
    method: any;
    url: string;
  }
  export interface Response {
    status: any;
  }
}