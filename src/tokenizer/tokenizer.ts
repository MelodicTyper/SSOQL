/**
 * SSOQL - Super Simple Object Query Language
 * Tokenizer
 */

import { Token, TokenType } from "../types/types";

/**
 * Tokenizer class for SSOQL
 * Converts raw text into a sequence of tokens
 */
export class Tokenizer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private column = 1;

  /**
   * Creates a new tokenizer
   * @param source The SSOQL query text to tokenize
   */
  constructor(source: string) {
    this.source = source;
  }

  /**
   * Scans the source code and produces tokens
   * @returns Array of tokens
   */
  tokenize(): Token[] {
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
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

  /**
   * Determines if we've reached the end of the source
   */
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  /**
   * Returns the current character and advances the position
   */
  private advance(): string {
    const char = this.source.charAt(this.current++);
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  /**
   * Looks at the current character without advancing
   */
  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  /**
   * Looks at the next character without advancing
   */
  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  /**
   * Checks if the current character matches the expected one
   * and advances if it does
   */
  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    this.column++;
    return true;
  }

  /**
   * Adds a token with the given type
   */
  private addToken(type: TokenType, value?: string): void {
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
  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      // Single-character tokens
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "[":
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case "]":
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "*":
        this.addToken(TokenType.ASTERISK);
        break;
      case "&":
        this.addToken(TokenType.AMPERSAND);
        break;
      case "|":
        this.addToken(TokenType.PIPE);
        break;

      // Two-character tokens
      case "=":
        this.addToken(TokenType.EQUALS);
        break;
      case "!":
        if (this.match("=")) {
          this.addToken(TokenType.NOT_EQUALS);
        } else {
          this.addToken(TokenType.NOT);
        }
        break;
      case ">":
        if (this.match("=")) {
          this.addToken(TokenType.GREATER_THAN_EQUALS);
        } else {
          this.addToken(TokenType.GREATER_THAN);
        }
        break;
      case "<":
        if (this.match("=")) {
          this.addToken(TokenType.LESS_THAN_EQUALS);
        } else {
          this.addToken(TokenType.LESS_THAN);
        }
        break;

      // Handle whitespace
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;
      case "\n":
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
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
          this.addToken(TokenType.COMMENT);
        } else {
          this.addToken(TokenType.UNKNOWN, c);
        }
        break;

      // Variables
      case "$":
        this.variable();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.addToken(TokenType.UNKNOWN, c);
        }
        break;
    }
  }

  /**
   * Processes a string literal
   */
  private string(quote: string = '"'): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      this.advance();
    }

    if (this.isAtEnd()) {
      // Unterminated string
      this.addToken(
        TokenType.UNKNOWN,
        this.source.substring(this.start, this.current),
      );
      return;
    }

    // The closing quote
    this.advance();

    // Trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  /**
   * Processes a variable name
   */
  private variable(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    // Include the $ in the variable name
    this.addToken(TokenType.VARIABLE);
  }

  /**
   * Processes a number
   */
  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a decimal part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const numStr = this.source.substring(this.start, this.current);
    this.addToken(TokenType.NUMBER, numStr);
  }

  /**
   * Processes an identifier or keyword
   */
  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);

    // Check for keywords
    switch (text) {
      // Keywords
      case "USE":
        this.addToken(TokenType.USE);
        break;
      case "QUERY":
        this.addToken(TokenType.QUERY);
        break;
      case "SELECT":
        this.addToken(TokenType.SELECT);
        break;
      case "EACH":
        this.addToken(TokenType.EACH);
        break;
      case "WHERE":
        this.addToken(TokenType.WHERE);
        break;
      case "RETURN":
        this.addToken(TokenType.RETURN);
        break;
      case "COUNT":
        this.addToken(TokenType.COUNT);
        break;
      case "SUM":
        this.addToken(TokenType.SUM);
        break;
      case "DIVIDE":
        this.addToken(TokenType.DIVIDE);
        break;
      case "MULTIPLY":
        this.addToken(TokenType.MULTIPLY);
        break;
      case "SUBTRACT":
        this.addToken(TokenType.SUBTRACT);
        break;
      case "AVERAGE":
        this.addToken(TokenType.AVERAGE);
        break;
      case "MEDIAN":
        this.addToken(TokenType.MEDIAN);
        break;
      case "MIN":
        this.addToken(TokenType.MIN);
        break;
      case "MAX":
        this.addToken(TokenType.MAX);
        break;
      case "PERCENT_OF":
        this.addToken(TokenType.PERCENT_OF);
        break;
      case "MOST_FREQUENT":
        this.addToken(TokenType.MOST_FREQUENT);
        break;
      case "LEAST_FREQUENT":
        this.addToken(TokenType.LEAST_FREQUENT);
        break;
      case "UNIQUE":
        this.addToken(TokenType.UNIQUE);
        break;
      case "STANDARD_DEVIATION":
        this.addToken(TokenType.STANDARD_DEVIATION);
        break;
      case "VARIANCE":
        this.addToken(TokenType.VARIANCE);
        break;
      case "RANGE":
        this.addToken(TokenType.RANGE);
        break;

      // Operators
      case "CONTAINS":
        this.addToken(TokenType.CONTAINS);
        break;
      case "NOT_CONTAINS":
        this.addToken(TokenType.NOT_CONTAINS);
        break;

      // Literals
      case "true":
        this.addToken(TokenType.BOOLEAN, "true");
        break;
      case "false":
        this.addToken(TokenType.BOOLEAN, "false");
        break;
      case "null":
        this.addToken(TokenType.NULL, "null");
        break;

      // Identifiers
      default:
        this.addToken(TokenType.IDENTIFIER);
        break;
    }
  }

  /**
   * Checks if a character is a digit
   */
  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  /**
   * Checks if a character is alphabetic
   */
  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  /**
   * Checks if a character is alphanumeric
   */
  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
