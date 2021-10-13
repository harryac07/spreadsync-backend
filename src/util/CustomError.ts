type ErrorTypes = 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR' | 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_ERROR' | 'NOT_ACTIVE_ERROR' | 'UNKNOWN_ERROR';

const responseCodes: Record<ErrorTypes, number> = {
  BAD_REQUEST: 400,
  DUPLICATE_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NOT_ACTIVE_ERROR: 403,
  NOT_FOUND: 404,
  UNKNOWN_ERROR: 500,
  INTERNAL_SERVER_ERROR: 500,
}

class HttpError extends Error {
  type: ErrorTypes;
  status: number;
  constructor(message: string, type: ErrorTypes) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.type = type;
    this.status = responseCodes?.[type] ?? 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequest extends HttpError {
  constructor(error = "Bad request") {
    super(error, 'BAD_REQUEST');
  }
}

class NotFound extends HttpError {
  constructor(error = 'Not Found') {
    super(error, 'NOT_FOUND');
  }
}

class AuthenticationError extends HttpError {
  constructor(error = 'Authentication error') {
    super(error, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends HttpError {
  constructor(error = 'Authorization error') {
    super(error, 'AUTHORIZATION_ERROR');
  }
}

class InternalServerError extends HttpError {
  constructor(error = 'Internal server error') {
    super(error, 'INTERNAL_SERVER_ERROR');
  }
}

class DuplicateError extends HttpError {
  constructor(error = "Duplicate error") {
    super(error, 'DUPLICATE_ERROR');
  }
}

class NotActiveError extends HttpError {
  constructor(error = "Not active error") {
    super(error, 'NOT_ACTIVE_ERROR');
  }
}

export {
  BadRequest,
  NotFound,
  AuthenticationError,
  AuthorizationError,
  InternalServerError,
  DuplicateError,
  NotActiveError,
};