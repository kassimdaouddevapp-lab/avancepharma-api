"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.TransactionStatus = exports.StatementStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["PHARMACY_ADMIN"] = "PHARMACY_ADMIN";
    UserRole["PHARMACY_AGENT"] = "PHARMACY_AGENT";
    UserRole["HR_MANAGER"] = "HR_MANAGER";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole || (exports.UserRole = UserRole = {}));
var StatementStatus;
(function (StatementStatus) {
    StatementStatus["DRAFT"] = "DRAFT";
    StatementStatus["SENT"] = "SENT";
    StatementStatus["VALIDATED"] = "VALIDATED";
    StatementStatus["DISPUTED"] = "DISPUTED";
    StatementStatus["CLOSED"] = "CLOSED";
})(StatementStatus || (exports.StatementStatus = StatementStatus = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["VALIDATED"] = "VALIDATED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["VALIDATE"] = "VALIDATE";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=enums.js.map