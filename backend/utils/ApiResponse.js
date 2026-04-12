/**
 * Uniform API response wrapper.
 * Every successful response goes through this.
 */
export class ApiResponse {
  constructor(statusCode, message, data = null, pagination = null) {
    this.success    = statusCode < 400;
    this.message    = message;
    if (data !== null)       this.data       = data;
    if (pagination !== null) this.pagination = pagination;
  }

  static ok(res, message, data, pagination = null) {
    return res.status(200).json(new ApiResponse(200, message, data, pagination));
  }

  static created(res, message, data) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }
}
