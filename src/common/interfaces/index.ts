export interface ErrorMetaData {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorMetaData?: ErrorMetaData[];
}
