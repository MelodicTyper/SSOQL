/**
 * SSOQL - Super Simple Object Query Language
 * Parser
 */
import { ProgramNode, Token } from "../types/types";
/**
 * Parser class for SSOQL
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
export declare class Parser {
    private tokens;
    private current;
    /**
     * Creates a new parser
     * @param tokens Array of tokens to parse
     */
    constructor(tokens: Token[]);
    /**
     * Parses tokens into an AST
     * @returns The root program node of the AST
     */
    parse(): ProgramNode;
    /**
     * Parses a USE statement
     * @returns USE path node
     */
    private parseUsePath;
    /**
     * Parses a field list in the format [field1, field2, ...]
     * @returns Array of field names
     */
    private parseFieldList;
    /**
     * Parses a QUERY block
     * @returns Query block node
     */
    private parseQueryBlock;
    /**
     * Parses a variable assignment operation
     * @returns Variable assignment node
     */
    private parseVariableAssignment;
    /**
     * Parses a SELECT operation
     * @returns Select operation node
     */
    private parseSelectOperation;
    /**
     * Parses a COUNT operation
     * @returns Count operation node
     */
    private parseCountOperation;
    /**
     * Parses a SUM operation
     * @returns Sum operation node
     */
    private parseSumOperation;
    /**
     * Parses a DIVIDE operation
     * @returns Divide operation node
     */
    private parseDivideOperation;
    /**
     * Parses a MULTIPLY operation
     * @returns Multiply operation node
     */
    private parseMultiplyOperation;
    /**
     * Parses a SUBTRACT operation
     * @returns Subtract operation node
     */
    private parseSubtractOperation;
    /**
     * Parses an AVERAGE operation
     * @returns Average operation node
     */
    private parseAverageOperation;
    /**
     * Parses a MEDIAN operation
     * @returns Median operation node
     */
    private parseMedianOperation;
    /**
     * Parses a MIN operation
     * @returns Min operation node
     */
    private parseMinOperation;
    /**
     * Parses a MAX operation
     * @returns Max operation node
     */
    private parseMaxOperation;
    /**
     * Parses a MOST_FREQUENT operation
     * @returns Most frequent operation node
     */
    private parseMostFrequentOperation;
    /**
     * Parses a LEAST_FREQUENT operation
     * @returns Least frequent operation node
     */
    private parseLeastFrequentOperation;
    /**
     * Parses a UNIQUE operation
     * @returns Unique operation node
     */
    private parseUniqueOperation;
    /**
     * Parses a STANDARD_DEVIATION operation
     * @returns Standard deviation operation node
     */
    private parseStandardDeviationOperation;
    /**
     * Parses a VARIANCE operation
     * @returns Variance operation node
     */
    private parseVarianceOperation;
    /**
     * Parses a RANGE operation
     * @returns Range operation node
     */
    private parseRangeOperation;
    /**
     * Parses a PERCENT_OF operation
     * @returns Percent of operation node
     */
    private parsePercentOfOperation;
    /**
     * Parses a condition expression
     * @returns Condition node
     */
    private parseCondition;
    /**
     * Parses a logical OR expression
     * @returns Condition node
     */
    private parseLogicalOr;
    /**
     * Parses a logical AND expression
     * @returns Condition node
     */
    private parseLogicalAnd;
    /**
     * Parses a unary NOT expression
     * @returns Condition node
     */
    private parseUnary;
    /**
     * Parses a primary condition expression
     * @returns Condition node
     */
    private parsePrimary;
    /**
     * Parses a value
     * @returns The parsed value
     */
    private parseValue;
    /**
     * Checks if the current token matches the given type
     * @param type Token type to check
     * @returns True if the token matches
     */
    private match;
    /**
     * Checks if the current token is of the given type
     * @param type Token type to check
     * @returns True if the token is of the given type
     */
    private check;
    /**
     * Advances to the next token and returns the previous one
     * @returns The previous token
     */
    private advance;
    /**
     * Checks if we've reached the end of the tokens
     * @returns True if we're at the end
     */
    private isAtEnd;
    /**
     * Gets the current token without advancing
     * @returns The current token
     */
    private peek;
    /**
     * Gets the previous token
     * @returns The previous token
     */
    private previous;
    /**
     * Consumes the current token if it matches the expected type
     * @param type Expected token type
     * @param message Error message if the token doesn't match
     * @returns The consumed token
     */
    private consume;
}
