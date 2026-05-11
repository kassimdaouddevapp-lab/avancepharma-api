import { UserRole } from './enums';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    pharmacyId?: string;
    employerId?: string;
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
//# sourceMappingURL=types.d.ts.map