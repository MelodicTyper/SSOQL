"use strict";
/**
 * SSOQL - Super Simple Object Query Language
 * Types definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorType = exports.TokenType = void 0;
/**
 * Token types for the lexer
 */
var TokenType;
(function (TokenType) {
    // Keywords
    TokenType["USE"] = "USE";
    TokenType["QUERY"] = "QUERY";
    TokenType["SELECT"] = "SELECT";
    TokenType["WHERE"] = "WHERE";
    TokenType["RETURN"] = "RETURN";
    TokenType["COUNT"] = "COUNT";
    TokenType["SUM"] = "SUM";
    TokenType["DIVIDE"] = "DIVIDE";
    TokenType["MULTIPLY"] = "MULTIPLY";
    TokenType["SUBTRACT"] = "SUBTRACT";
    TokenType["AVERAGE"] = "AVERAGE";
    TokenType["MEDIAN"] = "MEDIAN";
    TokenType["MIN"] = "MIN";
    TokenType["MAX"] = "MAX";
    TokenType["PERCENT_OF"] = "PERCENT_OF";
    TokenType["MOST_FREQUENT"] = "MOST_FREQUENT";
    TokenType["LEAST_FREQUENT"] = "LEAST_FREQUENT";
    TokenType["UNIQUE"] = "UNIQUE";
    TokenType["STANDARD_DEVIATION"] = "STANDARD_DEVIATION";
    TokenType["VARIANCE"] = "VARIANCE";
    TokenType["RANGE"] = "RANGE";
    TokenType["EACH"] = "EACH";
    // Operators
    TokenType["CONTAINS"] = "CONTAINS";
    TokenType["NOT_CONTAINS"] = "NOT_CONTAINS";
    // Symbols
    TokenType["VARIABLE"] = "VARIABLE";
    TokenType["ASTERISK"] = "ASTERISK";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["EQUALS"] = "EQUALS";
    TokenType["NOT_EQUALS"] = "NOT_EQUALS";
    TokenType["GREATER_THAN"] = "GREATER_THAN";
    TokenType["LESS_THAN"] = "LESS_THAN";
    TokenType["GREATER_THAN_EQUALS"] = "GREATER_THAN_EQUALS";
    TokenType["LESS_THAN_EQUALS"] = "LESS_THAN_EQUALS";
    TokenType["LEFT_BRACKET"] = "LEFT_BRACKET";
    TokenType["RIGHT_BRACKET"] = "RIGHT_BRACKET";
    TokenType["LEFT_PAREN"] = "LEFT_PAREN";
    TokenType["RIGHT_PAREN"] = "RIGHT_PAREN";
    TokenType["AMPERSAND"] = "AMPERSAND";
    TokenType["PIPE"] = "PIPE";
    TokenType["NOT"] = "NOT";
    // Literals
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["NULL"] = "NULL";
    // Special
    TokenType["COMMENT"] = "COMMENT";
    TokenType["EOF"] = "EOF";
    TokenType["UNKNOWN"] = "UNKNOWN";
})(TokenType || (exports.TokenType = TokenType = {}));
/**
 * Operator types supported in conditions
 */
var OperatorType;
(function (OperatorType) {
    OperatorType["EQUALS"] = "=";
    OperatorType["NOT_EQUALS"] = "!=";
    OperatorType["GREATER_THAN"] = ">";
    OperatorType["LESS_THAN"] = "<";
    OperatorType["GREATER_THAN_EQUALS"] = ">=";
    OperatorType["LESS_THAN_EQUALS"] = "<=";
    OperatorType["CONTAINS"] = "CONTAINS";
    OperatorType["NOT_CONTAINS"] = "NOT_CONTAINS";
    OperatorType["AND"] = "&";
    OperatorType["OR"] = "|";
    OperatorType["NOT"] = "!";
})(OperatorType || (exports.OperatorType = OperatorType = {}));
//# sourceMappingURL=types.js.map