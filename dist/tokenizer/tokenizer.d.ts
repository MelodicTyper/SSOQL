/**
 * SSOQL - Super Simple Object Query Language
 * Tokenizer
 */
import { Token } from "../types/types";
/**
 * Tokenizer class for SSOQL
 * Converts raw text into a sequence of tokens
 */
export declare class Tokenizer {
    private source;
    private tokens;
    private start;
    private current;
    private line;
    private column;
    /**
     * Creates a new tokenizer
     * @param source The SSOQL query text to tokenize
     */
    constructor(source: string);
    /**
     * Scans the source code and produces tokens
     * @returns Array of tokens
     */
    tokenize(): Token[];
    /**
     * Determines if we've reached the end of the source
     */
    private isAtEnd;
    /**
     * Returns the current character and advances the position
     */
    private advance;
    /**
     * Looks at the current character without advancing
     */
    private peek;
    /**
     * Looks at the next character without advancing
     */
    private peekNext;
    /**
     * Checks if the current character matches the expected one
     * and advances if it does
     */
    private match;
    /**
     * Adds a token with the given type
     */
    private addToken;
    /**
     * Processes a token
     */
    private scanToken;
    /**
     * Processes a string literal
     */
    private string;
    /**
     * Processes a variable name
     */
    private variable;
    /**
     * Processes a number
     */
    private number;
    /**
     * Processes an identifier or keyword
     */
    private identifier;
    /**
     * Checks if a character is a digit
     */
    private isDigit;
    /**
     * Checks if a character is alphabetic
     */
    private isAlpha;
    /**
     * Checks if a character is alphanumeric
     */
    private isAlphaNumeric;
}
