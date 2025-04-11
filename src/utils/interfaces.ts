export interface ApiResponse<T> {
  data: T;
  code: string;
  message: string;
}
