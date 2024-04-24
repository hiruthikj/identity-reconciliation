import { ApiResponse, ErrorMetaData } from '../interfaces';

export class APIResponseBuilder<T> {
  private response: ApiResponse<T>;

  constructor(message = 'success', data?: T, errorMetaData?: ErrorMetaData[]) {
    this.response = {
      success: true,
      message,
      data,
      errorMetaData,
    };
  }

  static success<T>(data: T, message = 'success') {
    return new APIResponseBuilder<T>(message, data);
  }

  static error<T>(message: string, errorMetaData?: ErrorMetaData[]) {
    return new APIResponseBuilder<T>(message, null, errorMetaData).setError();
  }

  setSuccess(success: boolean): this {
    this.response.success = success;
    return this;
  }

  setMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  setData(data: T): this {
    this.response.data = data;
    return this;
  }

  setError(errorMetaData?: ErrorMetaData[]): this {
    this.response.success = false;
    this.response.errorMetaData = errorMetaData ?? [];
    return this;
  }

  addErrorMetaData(code: string, message: string): this {
    if (!this.response.errorMetaData) {
      this.response.errorMetaData = [];
    }
    this.response.errorMetaData.push({ code, message });
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
}
