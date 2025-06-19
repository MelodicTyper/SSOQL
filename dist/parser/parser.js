"use strict";
/**
 * SSOQL - Super Simple Object Query Language
 * Parser
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const types_1 = require("../types/types");
/**
 * Parser class for SSOQL
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
class Parser {
    /**
     * Creates a new parser
     * @param tokens Array of tokens to parse
     */
    constructor(tokens) {
        this.tokens = [];
        this.current = 0;
        this.tokens = tokens;
    }
    /**
     * Parses tokens into an AST
     * @returns The root program node of the AST
     */
    parse() {
        const program = {
            type: "Program",
            usePaths: [],
            queryBlocks: [],
        };
        while (!this.isAtEnd()) {
            // Skip comments
            if (this.check(types_1.TokenType.COMMENT)) {
                this.advance();
                continue;
            }
            if (this.match(types_1.TokenType.USE)) {
                program.usePaths.push(this.parseUsePath());
            }
            else if (this.match(types_1.TokenType.QUERY)) {
                program.queryBlocks.push(this.parseQueryBlock());
            }
            else {
                // Skip unknown tokens
                this.advance();
            }
        }
        return program;
    }
    /**
     * Parses a USE statement
     * @returns USE path node
     */
    parseUsePath() {
        // Parse path components
        const pathComponents = [];
        let fields;
        // First path component should be an identifier
        if (this.check(types_1.TokenType.IDENTIFIER)) {
            pathComponents.push(this.consume(types_1.TokenType.IDENTIFIER, "Expected identifier in USE path")
                .value);
        }
        else {
            throw new Error(`Line ${this.peek().line}: Expected identifier in USE path`);
        }
        while (this.match(types_1.TokenType.DOT)) {
            if (this.check(types_1.TokenType.LEFT_BRACKET)) {
                // This is a field list
                this.advance(); // Consume [
                fields = this.parseFieldList();
                this.consume(types_1.TokenType.RIGHT_BRACKET, "Expected closing ']' after fields");
                break;
            }
            else if (this.check(types_1.TokenType.IDENTIFIER)) {
                pathComponents.push(this.advance().value);
            }
            else {
                throw new Error(`Line ${this.peek().line}: Expected identifier or fields in USE path`);
            }
        }
        return {
            type: "UsePath",
            path: pathComponents.join("."),
            fields,
        };
    }
    /**
     * Parses a field list in the format [field1, field2, ...]
     * @returns Array of field names
     */
    parseFieldList() {
        const fields = [];
        if (!this.check(types_1.TokenType.RIGHT_BRACKET)) {
            do {
                fields.push(this.consume(types_1.TokenType.IDENTIFIER, "Expected field name").value);
            } while (this.match(types_1.TokenType.COMMA));
        }
        return fields;
    }
    /**
     * Parses a QUERY block
     * @returns Query block node
     */
    parseQueryBlock() {
        const name = this.consume(types_1.TokenType.IDENTIFIER, "Expected query name after QUERY").value;
        const operations = [];
        while (!this.check(types_1.TokenType.RETURN) &&
            !this.check(types_1.TokenType.QUERY) &&
            !this.isAtEnd()) {
            if (this.check(types_1.TokenType.VARIABLE)) {
                operations.push(this.parseVariableAssignment());
            }
            else if (this.match(types_1.TokenType.SELECT)) {
                operations.push(this.parseSelectOperation());
            }
            else if (this.match(types_1.TokenType.COUNT)) {
                operations.push(this.parseCountOperation());
            }
            else if (this.match(types_1.TokenType.PERCENT_OF)) {
                operations.push(this.parsePercentOfOperation());
            }
            else if (this.match(types_1.TokenType.SUM)) {
                operations.push(this.parseSumOperation());
            }
            else if (this.match(types_1.TokenType.DIVIDE)) {
                operations.push(this.parseDivideOperation());
            }
            else if (this.match(types_1.TokenType.MULTIPLY)) {
                operations.push(this.parseMultiplyOperation());
            }
            else if (this.match(types_1.TokenType.SUBTRACT)) {
                operations.push(this.parseSubtractOperation());
            }
            else if (this.match(types_1.TokenType.AVERAGE)) {
                operations.push(this.parseAverageOperation());
            }
            else if (this.match(types_1.TokenType.MEDIAN)) {
                operations.push(this.parseMedianOperation());
            }
            else if (this.match(types_1.TokenType.MIN)) {
                operations.push(this.parseMinOperation());
            }
            else if (this.match(types_1.TokenType.MAX)) {
                operations.push(this.parseMaxOperation());
            }
            else if (this.match(types_1.TokenType.MOST_FREQUENT)) {
                operations.push(this.parseMostFrequentOperation());
            }
            else if (this.match(types_1.TokenType.LEAST_FREQUENT)) {
                operations.push(this.parseLeastFrequentOperation());
            }
            else if (this.match(types_1.TokenType.UNIQUE)) {
                operations.push(this.parseUniqueOperation());
            }
            else if (this.match(types_1.TokenType.STANDARD_DEVIATION)) {
                operations.push(this.parseStandardDeviationOperation());
            }
            else if (this.match(types_1.TokenType.VARIANCE)) {
                operations.push(this.parseVarianceOperation());
            }
            else if (this.match(types_1.TokenType.RANGE)) {
                operations.push(this.parseRangeOperation());
            }
            else {
                // Skip unknown tokens
                this.advance();
            }
        }
        // Consume RETURN
        this.consume(types_1.TokenType.RETURN, "Expected RETURN at end of query block");
        return {
            type: "QueryBlock",
            name,
            operations,
        };
    }
    /**
     * Parses a variable assignment operation
     * @returns Variable assignment node
     */
    parseVariableAssignment() {
        const variableName = this.consume(types_1.TokenType.VARIABLE, "Expected variable name").value;
        let operation;
        if (this.match(types_1.TokenType.SUM)) {
            operation = this.parseSumOperation();
        }
        else if (this.match(types_1.TokenType.COUNT)) {
            operation = this.parseCountOperation();
        }
        else if (this.match(types_1.TokenType.MOST_FREQUENT)) {
            operation = this.parseMostFrequentOperation();
        }
        else if (this.match(types_1.TokenType.LEAST_FREQUENT)) {
            operation = this.parseLeastFrequentOperation();
        }
        else if (this.match(types_1.TokenType.AVERAGE)) {
            operation = this.parseAverageOperation();
        }
        else if (this.match(types_1.TokenType.MEDIAN)) {
            operation = this.parseMedianOperation();
        }
        else if (this.match(types_1.TokenType.MIN)) {
            operation = this.parseMinOperation();
        }
        else if (this.match(types_1.TokenType.MAX)) {
            operation = this.parseMaxOperation();
        }
        else if (this.match(types_1.TokenType.UNIQUE)) {
            operation = this.parseUniqueOperation();
        }
        else if (this.match(types_1.TokenType.STANDARD_DEVIATION)) {
            operation = this.parseStandardDeviationOperation();
        }
        else if (this.match(types_1.TokenType.VARIANCE)) {
            operation = this.parseVarianceOperation();
        }
        else if (this.match(types_1.TokenType.RANGE)) {
            operation = this.parseRangeOperation();
        }
        else if (this.match(types_1.TokenType.SELECT)) {
            operation = this.parseSelectOperation();
        }
        else {
            throw new Error(`Line ${this.peek().line}: Expected operation after variable assignment`);
        }
        return {
            type: "VariableAssignment",
            name: variableName,
            operation,
        };
    }
    /**
     * Parses a SELECT operation
     * @returns Select operation node
     */
    parseSelectOperation() {
        // Check if EACH keyword is present
        const each = this.match(types_1.TokenType.EACH);
        // Parse fields (can be * or [field1, field2, ...])
        let fields;
        if (this.match(types_1.TokenType.ASTERISK)) {
            fields = "*";
        }
        else if (this.match(types_1.TokenType.LEFT_BRACKET)) {
            fields = this.parseFieldList();
            this.consume(types_1.TokenType.RIGHT_BRACKET, "Expected closing ']' after fields");
        }
        else if (this.check(types_1.TokenType.IDENTIFIER)) {
            fields = [this.advance().value];
        }
        else {
            // Default to * when no field is specified
            fields = "*";
        }
        // Parse WHERE clause if present
        let conditions;
        if (this.match(types_1.TokenType.WHERE)) {
            this.consume(types_1.TokenType.LEFT_PAREN, "Expected '(' after WHERE");
            conditions = this.parseCondition();
            this.consume(types_1.TokenType.RIGHT_PAREN, "Expected ')' after WHERE conditions");
        }
        return {
            type: "SelectOperation",
            fields,
            conditions,
            each,
        };
    }
    /**
     * Parses a COUNT operation
     * @returns Count operation node
     */
    parseCountOperation() {
        // For COUNT SELECT * syntax, we need to handle this specific case
        if (this.check(types_1.TokenType.SELECT)) {
            this.advance(); // Consume SELECT
            // Create a select operation with * as fields
            const selectOperation = {
                type: "SelectOperation",
                fields: "*",
            };
            // Parse WHERE clause if present
            if (this.match(types_1.TokenType.WHERE)) {
                this.consume(types_1.TokenType.LEFT_PAREN, "Expected '(' after WHERE");
                selectOperation.conditions = this.parseCondition();
                this.consume(types_1.TokenType.RIGHT_PAREN, "Expected ')' after WHERE conditions");
            }
            return {
                type: "CountOperation",
                selectOperation,
            };
        }
        // For other cases, parse as a normal select operation
        const selectOperation = this.parseSelectOperation();
        return {
            type: "CountOperation",
            selectOperation,
        };
    }
    /**
     * Parses a SUM operation
     * @returns Sum operation node
     */
    parseSumOperation() {
        return {
            type: "SumOperation",
        };
    }
    /**
     * Parses a DIVIDE operation
     * @returns Divide operation node
     */
    parseDivideOperation() {
        const dividend = this.consume(types_1.TokenType.VARIABLE, "Expected variable as dividend").value;
        const divisor = this.consume(types_1.TokenType.VARIABLE, "Expected variable as divisor").value;
        return {
            type: "DivideOperation",
            dividend,
            divisor,
        };
    }
    /**
     * Parses a MULTIPLY operation
     * @returns Multiply operation node
     */
    parseMultiplyOperation() {
        const factor1 = this.consume(types_1.TokenType.VARIABLE, "Expected variable as first factor").value;
        const factor2 = this.consume(types_1.TokenType.VARIABLE, "Expected variable as second factor").value;
        return {
            type: "MultiplyOperation",
            factor1,
            factor2,
        };
    }
    /**
     * Parses a SUBTRACT operation
     * @returns Subtract operation node
     */
    parseSubtractOperation() {
        const minuend = this.consume(types_1.TokenType.VARIABLE, "Expected variable as minuend").value;
        const subtrahend = this.consume(types_1.TokenType.VARIABLE, "Expected variable as subtrahend").value;
        return {
            type: "SubtractOperation",
            minuend,
            subtrahend,
        };
    }
    /**
     * Parses an AVERAGE operation
     * @returns Average operation node
     */
    parseAverageOperation() {
        return {
            type: "AverageOperation",
        };
    }
    /**
     * Parses a MEDIAN operation
     * @returns Median operation node
     */
    parseMedianOperation() {
        return {
            type: "MedianOperation",
        };
    }
    /**
     * Parses a MIN operation
     * @returns Min operation node
     */
    parseMinOperation() {
        return {
            type: "MinOperation",
        };
    }
    /**
     * Parses a MAX operation
     * @returns Max operation node
     */
    parseMaxOperation() {
        return {
            type: "MaxOperation",
        };
    }
    /**
     * Parses a MOST_FREQUENT operation
     * @returns Most frequent operation node
     */
    parseMostFrequentOperation() {
        return {
            type: "MostFrequentOperation",
        };
    }
    /**
     * Parses a LEAST_FREQUENT operation
     * @returns Least frequent operation node
     */
    parseLeastFrequentOperation() {
        return {
            type: "LeastFrequentOperation",
        };
    }
    /**
     * Parses a UNIQUE operation
     * @returns Unique operation node
     */
    parseUniqueOperation() {
        return {
            type: "UniqueOperation",
        };
    }
    /**
     * Parses a STANDARD_DEVIATION operation
     * @returns Standard deviation operation node
     */
    parseStandardDeviationOperation() {
        return {
            type: "StandardDeviationOperation",
        };
    }
    /**
     * Parses a VARIANCE operation
     * @returns Variance operation node
     */
    parseVarianceOperation() {
        return {
            type: "VarianceOperation",
        };
    }
    /**
     * Parses a RANGE operation
     * @returns Range operation node
     */
    parseRangeOperation() {
        return {
            type: "RangeOperation",
        };
    }
    /**
     * Parses a PERCENT_OF operation
     * @returns Percent of operation node
     */
    parsePercentOfOperation() {
        // Parse the first part which should be a SELECT operation
        let currentTokenIndex = this.current;
        let selectIsNext = false;
        // Look ahead to see if there's a SELECT after a possible comma
        for (let i = currentTokenIndex; i < this.tokens.length; i++) {
            if (this.tokens[i].type === types_1.TokenType.COMMA) {
                // Check if there's a SELECT after the comma
                if (i + 1 < this.tokens.length &&
                    this.tokens[i + 1].type === types_1.TokenType.SELECT) {
                    selectIsNext = true;
                    break;
                }
            }
        }
        // Create numerator select operation
        let numerator;
        if (this.check(types_1.TokenType.SELECT)) {
            this.advance(); // Consume SELECT
            numerator = {
                type: "SelectOperation",
                fields: "*",
            };
            // Parse WHERE clause if present for numerator
            if (this.match(types_1.TokenType.WHERE)) {
                this.consume(types_1.TokenType.LEFT_PAREN, "Expected '(' after WHERE");
                numerator.conditions = this.parseCondition();
                this.consume(types_1.TokenType.RIGHT_PAREN, "Expected ')' after WHERE conditions");
            }
        }
        else {
            numerator = this.parseSelectOperation();
        }
        // Check for comma followed by SELECT
        if (selectIsNext) {
            this.match(types_1.TokenType.COMMA); // Consume comma if present
        }
        // Create denominator select operation
        let denominator;
        if (this.check(types_1.TokenType.SELECT)) {
            this.advance(); // Consume SELECT
            denominator = {
                type: "SelectOperation",
                fields: "*",
            };
            // Parse WHERE clause if present for denominator
            if (this.match(types_1.TokenType.WHERE)) {
                this.consume(types_1.TokenType.LEFT_PAREN, "Expected '(' after WHERE");
                denominator.conditions = this.parseCondition();
                this.consume(types_1.TokenType.RIGHT_PAREN, "Expected ')' after WHERE conditions");
            }
        }
        else {
            denominator = this.parseSelectOperation();
        }
        return {
            type: "PercentOfOperation",
            numerator,
            denominator,
        };
    }
    /**
     * Parses a condition expression
     * @returns Condition node
     */
    parseCondition() {
        return this.parseLogicalOr();
    }
    /**
     * Parses a logical OR expression
     * @returns Condition node
     */
    parseLogicalOr() {
        let expr = this.parseLogicalAnd();
        while (this.match(types_1.TokenType.PIPE)) {
            const right = this.parseLogicalAnd();
            expr = {
                type: "BinaryCondition",
                operator: types_1.OperatorType.OR,
                left: expr,
                right,
            };
        }
        return expr;
    }
    /**
     * Parses a logical AND expression
     * @returns Condition node
     */
    parseLogicalAnd() {
        let expr = this.parseUnary();
        while (this.match(types_1.TokenType.AMPERSAND)) {
            const right = this.parseUnary();
            expr = {
                type: "BinaryCondition",
                operator: types_1.OperatorType.AND,
                left: expr,
                right,
            };
        }
        return expr;
    }
    /**
     * Parses a unary NOT expression
     * @returns Condition node
     */
    parseUnary() {
        if (this.match(types_1.TokenType.NOT)) {
            const condition = this.parseUnary();
            return {
                type: "UnaryCondition",
                operator: types_1.OperatorType.NOT,
                condition,
            };
        }
        return this.parsePrimary();
    }
    /**
     * Parses a primary condition expression
     * @returns Condition node
     */
    parsePrimary() {
        if (this.match(types_1.TokenType.LEFT_PAREN)) {
            const expr = this.parseCondition();
            this.consume(types_1.TokenType.RIGHT_PAREN, "Expected ')' after expression");
            return expr;
        }
        // Must be a field comparison
        const field = this.consume(types_1.TokenType.IDENTIFIER, "Expected field name in condition").value;
        let operator;
        if (this.match(types_1.TokenType.EQUALS)) {
            operator = types_1.OperatorType.EQUALS;
        }
        else if (this.match(types_1.TokenType.NOT_EQUALS)) {
            operator = types_1.OperatorType.NOT_EQUALS;
        }
        else if (this.match(types_1.TokenType.GREATER_THAN)) {
            operator = types_1.OperatorType.GREATER_THAN;
        }
        else if (this.match(types_1.TokenType.LESS_THAN)) {
            operator = types_1.OperatorType.LESS_THAN;
        }
        else if (this.match(types_1.TokenType.GREATER_THAN_EQUALS)) {
            operator = types_1.OperatorType.GREATER_THAN_EQUALS;
        }
        else if (this.match(types_1.TokenType.LESS_THAN_EQUALS)) {
            operator = types_1.OperatorType.LESS_THAN_EQUALS;
        }
        else if (this.match(types_1.TokenType.CONTAINS)) {
            operator = types_1.OperatorType.CONTAINS;
        }
        else if (this.match(types_1.TokenType.NOT_CONTAINS)) {
            operator = types_1.OperatorType.NOT_CONTAINS;
        }
        else {
            throw new Error(`Line ${this.peek().line}: Expected operator in condition`);
        }
        const value = this.parseValue();
        return {
            type: "ComparisonCondition",
            field,
            operator,
            value,
        };
    }
    /**
     * Parses a value
     * @returns The parsed value
     */
    parseValue() {
        if (this.match(types_1.TokenType.STRING)) {
            return this.previous().value;
        }
        if (this.match(types_1.TokenType.NUMBER)) {
            return parseFloat(this.previous().value);
        }
        if (this.match(types_1.TokenType.BOOLEAN)) {
            return this.previous().value === "true";
        }
        if (this.match(types_1.TokenType.NULL)) {
            return null;
        }
        if (this.match(types_1.TokenType.VARIABLE)) {
            // Return the variable name with the $ prefix
            return this.previous().value;
        }
        throw new Error(`Line ${this.peek().line}: Expected value in condition`);
    }
    /**
     * Checks if the current token matches the given type
     * @param type Token type to check
     * @returns True if the token matches
     */
    match(type) {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }
    /**
     * Checks if the current token is of the given type
     * @param type Token type to check
     * @returns True if the token is of the given type
     */
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    /**
     * Advances to the next token and returns the previous one
     * @returns The previous token
     */
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    /**
     * Checks if we've reached the end of the tokens
     * @returns True if we're at the end
     */
    isAtEnd() {
        return this.peek().type === types_1.TokenType.EOF;
    }
    /**
     * Gets the current token without advancing
     * @returns The current token
     */
    peek() {
        return this.tokens[this.current];
    }
    /**
     * Gets the previous token
     * @returns The previous token
     */
    previous() {
        return this.tokens[this.current - 1];
    }
    /**
     * Consumes the current token if it matches the expected type
     * @param type Expected token type
     * @param message Error message if the token doesn't match
     * @returns The consumed token
     */
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw new Error(`Line ${this.peek().line}: ${message}`);
    }
}
exports.Parser = Parser;
