"use strict";
/**
 * SSOQL - Super Simple Object Query Language
 * Tokenizer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const types_1 = require("../types/types");
/**
 * Tokenizer class for SSOQL
 * Converts raw text into a sequence of tokens
 */
class Tokenizer {
    /**
     * Creates a new tokenizer
     * @param source The SSOQL query text to tokenize
     */
    constructor(source) {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.column = 1;
        this.source = source;
    }
    /**
     * Scans the source code and produces tokens
     * @returns Array of tokens
     */
    tokenize() {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.column = 1;
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push({
            type: types_1.TokenType.EOF,
            value: '',
            line: this.line,
            column: this.column,
        });
        return this.tokens;
    }
    /**
     * Determines if we've reached the end of the source
     */
    isAtEnd() {
        return this.current >= this.source.length;
    }
    /**
     * Returns the current character and advances the position
     */
    advance() {
        const char = this.source.charAt(this.current++);
        if (char === '\n') {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return char;
    }
    /**
     * Looks at the current character without advancing
     */
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.source.charAt(this.current);
    }
    /**
     * Looks at the next character without advancing
     */
    peekNext() {
        if (this.current + 1 >= this.source.length)
            return '\0';
        return this.source.charAt(this.current + 1);
    }
    /**
     * Checks if the current character matches the expected one
     * and advances if it does
     */
    match(expected) {
        if (this.isAtEnd())
            return false;
        if (this.source.charAt(this.current) !== expected)
            return false;
        this.current++;
        this.column++;
        return true;
    }
    /**
     * Adds a token with the given type
     */
    addToken(type, value) {
        const text = value ?? this.source.substring(this.start, this.current);
        this.tokens.push({
            type,
            value: text,
            line: this.line,
            column: this.column - (this.current - this.start),
        });
    }
    /**
     * Processes a token
     */
    scanToken() {
        const c = this.advance();
        switch (c) {
            // Single-character tokens
            case '(':
                this.addToken(types_1.TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(types_1.TokenType.RIGHT_PAREN);
                break;
            case '[':
                this.addToken(types_1.TokenType.LEFT_BRACKET);
                break;
            case ']':
                this.addToken(types_1.TokenType.RIGHT_BRACKET);
                break;
            case ',':
                this.addToken(types_1.TokenType.COMMA);
                break;
            case '.':
                this.addToken(types_1.TokenType.DOT);
                break;
            case '*':
                this.addToken(types_1.TokenType.ASTERISK);
                break;
            case '&':
                this.addToken(types_1.TokenType.AMPERSAND);
                break;
            case '|':
                this.addToken(types_1.TokenType.PIPE);
                break;
            // Two-character tokens
            case '=':
                this.addToken(types_1.TokenType.EQUALS);
                break;
            case '!':
                if (this.match('=')) {
                    this.addToken(types_1.TokenType.NOT_EQUALS);
                }
                else {
                    this.addToken(types_1.TokenType.NOT);
                }
                break;
            case '>':
                if (this.match('=')) {
                    this.addToken(types_1.TokenType.GREATER_THAN_EQUALS);
                }
                else {
                    this.addToken(types_1.TokenType.GREATER_THAN);
                }
                break;
            case '<':
                if (this.match('=')) {
                    this.addToken(types_1.TokenType.LESS_THAN_EQUALS);
                }
                else {
                    this.addToken(types_1.TokenType.LESS_THAN);
                }
                break;
            // Handle whitespace
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                // Already handled in advance()
                break;
            // String literals
            case '"':
                this.string();
                break;
            case "'":
                this.string("'");
                break;
            // Comments
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                    this.addToken(types_1.TokenType.COMMENT);
                }
                else {
                    this.addToken(types_1.TokenType.UNKNOWN, c);
                }
                break;
            // Variables
            case '$':
                this.variable();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    this.addToken(types_1.TokenType.UNKNOWN, c);
                }
                break;
        }
    }
    /**
     * Processes a string literal
     */
    string(quote = '"') {
        while (this.peek() !== quote && !this.isAtEnd()) {
            this.advance();
        }
        if (this.isAtEnd()) {
            // Unterminated string
            this.addToken(types_1.TokenType.UNKNOWN, this.source.substring(this.start, this.current));
            return;
        }
        // The closing quote
        this.advance();
        // Trim the surrounding quotes
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(types_1.TokenType.STRING, value);
    }
    /**
     * Processes a variable name
     */
    variable() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        // Include the $ in the variable name
        this.addToken(types_1.TokenType.VARIABLE);
    }
    /**
     * Processes a number
     */
    number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }
        // Look for a decimal part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }
        const numStr = this.source.substring(this.start, this.current);
        this.addToken(types_1.TokenType.NUMBER, numStr);
    }
    /**
     * Processes an identifier or keyword
     */
    identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        const text = this.source.substring(this.start, this.current);
        // Check for keywords
        switch (text) {
            // Keywords
            case 'USE':
                this.addToken(types_1.TokenType.USE);
                break;
            case 'QUERY':
                this.addToken(types_1.TokenType.QUERY);
                break;
            case 'SELECT':
                this.addToken(types_1.TokenType.SELECT);
                break;
            case 'WHERE':
                this.addToken(types_1.TokenType.WHERE);
                break;
            case 'RETURN':
                this.addToken(types_1.TokenType.RETURN);
                break;
            case 'COUNT':
                this.addToken(types_1.TokenType.COUNT);
                break;
            case 'SUM':
                this.addToken(types_1.TokenType.SUM);
                break;
            case 'DIVIDE':
                this.addToken(types_1.TokenType.DIVIDE);
                break;
            case 'MULTIPLY':
                this.addToken(types_1.TokenType.MULTIPLY);
                break;
            case 'SUBTRACT':
                this.addToken(types_1.TokenType.SUBTRACT);
                break;
            case 'AVERAGE':
                this.addToken(types_1.TokenType.AVERAGE);
                break;
            case 'MEDIAN':
                this.addToken(types_1.TokenType.MEDIAN);
                break;
            case 'MIN':
                this.addToken(types_1.TokenType.MIN);
                break;
            case 'MAX':
                this.addToken(types_1.TokenType.MAX);
                break;
            case 'PERCENT_OF':
                this.addToken(types_1.TokenType.PERCENT_OF);
                break;
            case 'MOST_FREQUENT':
                this.addToken(types_1.TokenType.MOST_FREQUENT);
                break;
            case 'LEAST_FREQUENT':
                this.addToken(types_1.TokenType.LEAST_FREQUENT);
                break;
            case 'UNIQUE':
                this.addToken(types_1.TokenType.UNIQUE);
                break;
            case 'STANDARD_DEVIATION':
                this.addToken(types_1.TokenType.STANDARD_DEVIATION);
                break;
            case 'VARIANCE':
                this.addToken(types_1.TokenType.VARIANCE);
                break;
            case 'RANGE':
                this.addToken(types_1.TokenType.RANGE);
                break;
            // Operators
            case 'CONTAINS':
                this.addToken(types_1.TokenType.CONTAINS);
                break;
            case 'NOT_CONTAINS':
                this.addToken(types_1.TokenType.NOT_CONTAINS);
                break;
            // Literals
            case 'true':
                this.addToken(types_1.TokenType.BOOLEAN, 'true');
                break;
            case 'false':
                this.addToken(types_1.TokenType.BOOLEAN, 'false');
                break;
            case 'null':
                this.addToken(types_1.TokenType.NULL, 'null');
                break;
            // Identifiers
            default:
                this.addToken(types_1.TokenType.IDENTIFIER);
                break;
        }
    }
    /**
     * Checks if a character is a digit
     */
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    /**
     * Checks if a character is alphabetic
     */
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_';
    }
    /**
     * Checks if a character is alphanumeric
     */
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}
exports.Tokenizer = Tokenizer;
