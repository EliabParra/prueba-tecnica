export interface LoginRequestDTO {
  username: string
  password: string
}

export interface AuthResponseDTO {
  token?: string | null
  expiresAt: string
}
