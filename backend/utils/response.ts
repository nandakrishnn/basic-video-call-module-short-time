export interface SuccessResponse<T> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ErrorResponseBody {
  success: false
  message: string
  code: string
  timestamp: string
}

export const successResponse = <T>(data: T, message: string): SuccessResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
})

export const errorResponse = (message: string, code: string): ErrorResponseBody => ({
  success: false,
  message,
  code,
  timestamp: new Date().toISOString(),
})
