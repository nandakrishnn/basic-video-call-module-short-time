export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  code: string
  timestamp: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
