import { UserRole } from './enums';

export interface JwtPayload {
  sub: string;           // userId (UUID)
  email: string;
  role: UserRole;
  jti?: string;          // JWT ID for token uniqueness
  pharmacyId?: string;   // si agent ou admin pharmacie
  employerId?: string;   // si RH
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}