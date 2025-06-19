/**
 * SSOQL - Super Simple Object Query Language
 * Parser
 */

import {
  ASTNode,
  BinaryConditionNode,
  ComparisonConditionNode,
  ConditionNode,
  CountOperationNode,
  DivideOperationNode,
  MultiplyOperationNode,
  SubtractOperationNode,
  AverageOperationNode,
  MedianOperationNode,
  MinOperationNode,
  MaxOperationNode,
  MostFrequentOperationNode,
  LeastFrequentOperationNode,
  UniqueOperationNode,
  StandardDeviationOperationNode,
  VarianceOperationNode,
  RangeOperationNode,
  OperationNode,
  OperatorType,
  PercentOfOperationNode,
  ProgramNode,
  QueryBlockNode,
  SelectOperationNode,
  SumOperationNode,
  Token,
  TokenType,
  UnaryConditionNode,
  UsePathNode,
  ValueType,
  VariableAssignmentNode,
} from "../types/types";

/**
 * Parser class for SSOQL
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  /**
   * Creates a new parser
   * @param tokens Array of tokens to parse
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parses tokens into an AST
   * @returns The root program node of the AST
   */
  parse(): ProgramNode {
    const program: ProgramNode = {
      type: "Program",
      usePaths: [],
      queryBlocks: [],
    };

    while (!this.isAtEnd()) {
      // Skip comments
      if (this.check(TokenType.COMMENT)) {
        this.advance();
        continue;
      }

      if (this.match(TokenType.USE)) {
        program.usePaths.push(this.parseUsePath());
      } else if (this.match(TokenType.QUERY)) {
        program.queryBlocks.push(this.parseQueryBlock());
      } else {
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
  private parseUsePath(): UsePathNode {
    // Parse path components
    const pathComponents: string[] = [];
    let fields: string[] | undefined;

    // First path component should be an identifier
    if (this.check(TokenType.IDENTIFIER)) {
      pathComponents.push(
        this.consume(TokenType.IDENTIFIER, "Expected identifier in USE path")
          .value,
      );
    } else {
      throw new Error(
        `Line ${this.peek().line}: Expected identifier in USE path`,
      );
    }

    while (this.match(TokenType.DOT)) {
      if (this.check(TokenType.LEFT_BRACKET)) {
        // This is a field list
        this.advance(); // Consume [
        fields = this.parseFieldList();
        this.consume(
          TokenType.RIGHT_BRACKET,
          "Expected closing ']' after fields",
        );
        break;
      } else if (this.check(TokenType.IDENTIFIER)) {
        pathComponents.push(this.advance().value);
      } else {
        throw new Error(
          `Line ${this.peek().line}: Expected identifier or fields in USE path`,
        );
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
  private parseFieldList(): string[] {
    const fields: string[] = [];

    if (!this.check(TokenType.RIGHT_BRACKET)) {
      do {
        fields.push(
          this.consume(TokenType.IDENTIFIER, "Expected field name").value,
        );
      } while (this.match(TokenType.COMMA));
    }

    return fields;
  }

  /**
   * Parses a QUERY block
   * @returns Query block node
   */
  private parseQueryBlock(): QueryBlockNode {
    const name = this.consume(
      TokenType.IDENTIFIER,
      "Expected query name after QUERY",
    ).value;
    const operations: OperationNode[] = [];

    while (
      !this.check(TokenType.RETURN) &&
      !this.check(TokenType.QUERY) &&
      !this.isAtEnd()
    ) {
      if (this.check(TokenType.VARIABLE)) {
        operations.push(this.parseVariableAssignment());
      } else if (this.match(TokenType.SELECT)) {
        operations.push(this.parseSelectOperation());
      } else if (this.match(TokenType.COUNT)) {
        operations.push(this.parseCountOperation());
      } else if (this.match(TokenType.PERCENT_OF)) {
        operations.push(this.parsePercentOfOperation());
      } else if (this.match(TokenType.SUM)) {
        operations.push(this.parseSumOperation());
      } else if (this.match(TokenType.DIVIDE)) {
        operations.push(this.parseDivideOperation());
      } else if (this.match(TokenType.MULTIPLY)) {
        operations.push(this.parseMultiplyOperation());
      } else if (this.match(TokenType.SUBTRACT)) {
        operations.push(this.parseSubtractOperation());
      } else if (this.match(TokenType.AVERAGE)) {
        operations.push(this.parseAverageOperation());
      } else if (this.match(TokenType.MEDIAN)) {
        operations.push(this.parseMedianOperation());
      } else if (this.match(TokenType.MIN)) {
        operations.push(this.parseMinOperation());
      } else if (this.match(TokenType.MAX)) {
        operations.push(this.parseMaxOperation());
      } else if (this.match(TokenType.MOST_FREQUENT)) {
        operations.push(this.parseMostFrequentOperation());
      } else if (this.match(TokenType.LEAST_FREQUENT)) {
        operations.push(this.parseLeastFrequentOperation());
      } else if (this.match(TokenType.UNIQUE)) {
        operations.push(this.parseUniqueOperation());
      } else if (this.match(TokenType.STANDARD_DEVIATION)) {
        operations.push(this.parseStandardDeviationOperation());
      } else if (this.match(TokenType.VARIANCE)) {
        operations.push(this.parseVarianceOperation());
      } else if (this.match(TokenType.RANGE)) {
        operations.push(this.parseRangeOperation());
      } else {
        // Skip unknown tokens
        this.advance();
      }
    }

    // Consume RETURN
    this.consume(TokenType.RETURN, "Expected RETURN at end of query block");

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
  private parseVariableAssignment(): VariableAssignmentNode {
    const variableName = this.consume(
      TokenType.VARIABLE,
      "Expected variable name",
    ).value;

    let operation: OperationNode;

    if (this.match(TokenType.SUM)) {
      operation = this.parseSumOperation();
    } else if (this.match(TokenType.COUNT)) {
      operation = this.parseCountOperation();
    } else if (this.match(TokenType.MOST_FREQUENT)) {
      operation = this.parseMostFrequentOperation();
    } else if (this.match(TokenType.LEAST_FREQUENT)) {
      operation = this.parseLeastFrequentOperation();
    } else if (this.match(TokenType.AVERAGE)) {
      operation = this.parseAverageOperation();
    } else if (this.match(TokenType.MEDIAN)) {
      operation = this.parseMedianOperation();
    } else if (this.match(TokenType.MIN)) {
      operation = this.parseMinOperation();
    } else if (this.match(TokenType.MAX)) {
      operation = this.parseMaxOperation();
    } else if (this.match(TokenType.UNIQUE)) {
      operation = this.parseUniqueOperation();
    } else if (this.match(TokenType.STANDARD_DEVIATION)) {
      operation = this.parseStandardDeviationOperation();
    } else if (this.match(TokenType.VARIANCE)) {
      operation = this.parseVarianceOperation();
    } else if (this.match(TokenType.RANGE)) {
      operation = this.parseRangeOperation();
    } else if (this.match(TokenType.SELECT)) {
      operation = this.parseSelectOperation();
    } else {
      throw new Error(
        `Line ${this.peek().line}: Expected operation after variable assignment`,
      );
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
  private parseSelectOperation(): SelectOperationNode {
    // Check if EACH keyword is present
    const each = this.match(TokenType.EACH);
    // TODO make EACH more robust and make sure it's in the right position.
    // Parse fields (can be * or [field1, field2, ...])
    let fields: string[] | "*";

    if (this.match(TokenType.ASTERISK)) {
      fields = "*";
    } else if (this.match(TokenType.LEFT_BRACKET)) {
      fields = this.parseFieldList();
      this.consume(
        TokenType.RIGHT_BRACKET,
        "Expected closing ']' after fields",
      );
    } else if (this.check(TokenType.IDENTIFIER)) {
      fields = [this.advance().value];
    } else {
      // Default to * when no field is specified
      fields = "*";
    }

    // Parse WHERE clause if present
    let conditions: ConditionNode | undefined;
    if (this.match(TokenType.WHERE)) {
      this.consume(TokenType.LEFT_PAREN, "Expected '(' after WHERE");
      conditions = this.parseCondition();
      this.consume(
        TokenType.RIGHT_PAREN,
        "Expected ')' after WHERE conditions",
      );
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
  private parseCountOperation(): CountOperationNode {
    // For COUNT SELECT * syntax, we need to handle this specific case
    if (this.check(TokenType.SELECT)) {
      this.advance(); // Consume SELECT

      // TODO this doesn't actually handle selections as they should be at all?
      // Create a select operation with * as fields
      const selectOperation: SelectOperationNode = {
        type: "SelectOperation",
        fields: "*",
      };

      // Parse WHERE clause if present
      if (this.match(TokenType.WHERE)) {
        this.consume(TokenType.LEFT_PAREN, "Expected '(' after WHERE");
        selectOperation.conditions = this.parseCondition();
        this.consume(
          TokenType.RIGHT_PAREN,
          "Expected ')' after WHERE conditions",
        );
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
  private parseSumOperation(): SumOperationNode {
    return {
      type: "SumOperation",
    };
  }

  /**
   * Parses a DIVIDE operation
   * @returns Divide operation node
   */
  private parseDivideOperation(): DivideOperationNode {
    // TODO update this and all other multiply and such operations to consume context when there's only one variable
    const dividend = this.consume(
      TokenType.VARIABLE,
      "Expected variable as dividend",
    ).value;
    const divisor = this.consume(
      TokenType.VARIABLE,
      "Expected variable as divisor",
    ).value;

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
  private parseMultiplyOperation(): MultiplyOperationNode {
    const factor1 = this.consume(
      TokenType.VARIABLE,
      "Expected variable as first factor",
    ).value;
    const factor2 = this.consume(
      TokenType.VARIABLE,
      "Expected variable as second factor",
    ).value;

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
  private parseSubtractOperation(): SubtractOperationNode {
    const minuend = this.consume(
      TokenType.VARIABLE,
      "Expected variable as minuend",
    ).value;
    const subtrahend = this.consume(
      TokenType.VARIABLE,
      "Expected variable as subtrahend",
    ).value;

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
  private parseAverageOperation(): AverageOperationNode {
    return {
      type: "AverageOperation",
    };
  }

  /**
   * Parses a MEDIAN operation
   * @returns Median operation node
   */
  private parseMedianOperation(): MedianOperationNode {
    return {
      type: "MedianOperation",
    };
  }

  /**
   * Parses a MIN operation
   * @returns Min operation node
   */
  private parseMinOperation(): MinOperationNode {
    return {
      type: "MinOperation",
    };
  }

  /**
   * Parses a MAX operation
   * @returns Max operation node
   */
  private parseMaxOperation(): MaxOperationNode {
    return {
      type: "MaxOperation",
    };
  }

  /**
   * Parses a MOST_FREQUENT operation
   * @returns Most frequent operation node
   */
  private parseMostFrequentOperation(): MostFrequentOperationNode {
    return {
      type: "MostFrequentOperation",
    };
  }

  /**
   * Parses a LEAST_FREQUENT operation
   * @returns Least frequent operation node
   */
  private parseLeastFrequentOperation(): LeastFrequentOperationNode {
    return {
      type: "LeastFrequentOperation",
    };
  }

  /**
   * Parses a UNIQUE operation
   * @returns Unique operation node
   */
  private parseUniqueOperation(): UniqueOperationNode {
    return {
      type: "UniqueOperation",
    };
  }

  /**
   * Parses a STANDARD_DEVIATION operation
   * @returns Standard deviation operation node
   */
  private parseStandardDeviationOperation(): StandardDeviationOperationNode {
    return {
      type: "StandardDeviationOperation",
    };
  }

  /**
   * Parses a VARIANCE operation
   * @returns Variance operation node
   */
  private parseVarianceOperation(): VarianceOperationNode {
    return {
      type: "VarianceOperation",
    };
  }

  /**
   * Parses a RANGE operation
   * @returns Range operation node
   */
  private parseRangeOperation(): RangeOperationNode {
    return {
      type: "RangeOperation",
    };
  }

  /**
   * Parses a PERCENT_OF operation
   * @returns Percent of operation node
   */
  private parsePercentOfOperation(): PercentOfOperationNode {
    // Parse the first part which should be a SELECT operation
    let currentTokenIndex = this.current;
    let selectIsNext = false;

    // Look ahead to see if there's a SELECT after a possible comma
    for (let i = currentTokenIndex; i < this.tokens.length; i++) {
      if (this.tokens[i].type === TokenType.COMMA) {
        // Check if there's a SELECT after the comma
        if (
          i + 1 < this.tokens.length &&
          this.tokens[i + 1].type === TokenType.SELECT
        ) {
          selectIsNext = true;
          break;
        }
      }
    }

    // Create numerator select operation
    let numerator: SelectOperationNode;

    if (this.check(TokenType.SELECT)) {
      this.advance(); // Consume SELECT
      numerator = {
        type: "SelectOperation",
        fields: "*",
      };

      // Parse WHERE clause if present for numerator
      if (this.match(TokenType.WHERE)) {
        this.consume(TokenType.LEFT_PAREN, "Expected '(' after WHERE");
        numerator.conditions = this.parseCondition();
        this.consume(
          TokenType.RIGHT_PAREN,
          "Expected ')' after WHERE conditions",
        );
      }
    } else {
      numerator = this.parseSelectOperation();
    }

    // Check for comma followed by SELECT
    if (selectIsNext) {
      this.match(TokenType.COMMA); // Consume comma if present
    }

    // Create denominator select operation
    let denominator: SelectOperationNode;

    if (this.check(TokenType.SELECT)) {
      this.advance(); // Consume SELECT
      denominator = {
        type: "SelectOperation",
        fields: "*",
      };

      // Parse WHERE clause if present for denominator
      if (this.match(TokenType.WHERE)) {
        this.consume(TokenType.LEFT_PAREN, "Expected '(' after WHERE");
        denominator.conditions = this.parseCondition();
        this.consume(
          TokenType.RIGHT_PAREN,
          "Expected ')' after WHERE conditions",
        );
      }
    } else {
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
  private parseCondition(): ConditionNode {
    return this.parseLogicalOr();
  }

  /**
   * Parses a logical OR expression
   * @returns Condition node
   */
  private parseLogicalOr(): ConditionNode {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.PIPE)) {
      const right = this.parseLogicalAnd();
      expr = {
        type: "BinaryCondition",
        operator: OperatorType.OR,
        left: expr,
        right,
      } as BinaryConditionNode;
    }

    return expr;
  }

  /**
   * Parses a logical AND expression
   * @returns Condition node
   */
  private parseLogicalAnd(): ConditionNode {
    let expr = this.parseUnary();

    while (this.match(TokenType.AMPERSAND)) {
      const right = this.parseUnary();
      expr = {
        type: "BinaryCondition",
        operator: OperatorType.AND,
        left: expr,
        right,
      } as BinaryConditionNode;
    }

    return expr;
  }

  /**
   * Parses a unary NOT expression
   * @returns Condition node
   */
  private parseUnary(): ConditionNode {
    if (this.match(TokenType.NOT)) {
      const condition = this.parseUnary();
      return {
        type: "UnaryCondition",
        operator: OperatorType.NOT,
        condition,
      } as UnaryConditionNode;
    }

    return this.parsePrimary();
  }

  /**
   * Parses a primary condition expression
   * @returns Condition node
   */
  private parsePrimary(): ConditionNode {
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.parseCondition();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }

    // Must be a field comparison
    const field = this.consume(
      TokenType.IDENTIFIER,
      "Expected field name in condition",
    ).value;

    let operator: OperatorType;
    if (this.match(TokenType.EQUALS)) {
      operator = OperatorType.EQUALS;
    } else if (this.match(TokenType.NOT_EQUALS)) {
      operator = OperatorType.NOT_EQUALS;
    } else if (this.match(TokenType.GREATER_THAN)) {
      operator = OperatorType.GREATER_THAN;
    } else if (this.match(TokenType.LESS_THAN)) {
      operator = OperatorType.LESS_THAN;
    } else if (this.match(TokenType.GREATER_THAN_EQUALS)) {
      operator = OperatorType.GREATER_THAN_EQUALS;
    } else if (this.match(TokenType.LESS_THAN_EQUALS)) {
      operator = OperatorType.LESS_THAN_EQUALS;
    } else if (this.match(TokenType.CONTAINS)) {
      operator = OperatorType.CONTAINS;
    } else if (this.match(TokenType.NOT_CONTAINS)) {
      operator = OperatorType.NOT_CONTAINS;
    } else {
      throw new Error(
        `Line ${this.peek().line}: Expected operator in condition`,
      );
    }

    const value = this.parseValue();

    return {
      type: "ComparisonCondition",
      field,
      operator,
      value,
    } as ComparisonConditionNode;
  }

  /**
   * Parses a value
   * @returns The parsed value
   */
  private parseValue(): ValueType {
    if (this.match(TokenType.STRING)) {
      return this.previous().value;
    }

    if (this.match(TokenType.NUMBER)) {
      return parseFloat(this.previous().value);
    }

    if (this.match(TokenType.BOOLEAN)) {
      return this.previous().value === "true";
    }

    if (this.match(TokenType.NULL)) {
      return null;
    }

    if (this.match(TokenType.VARIABLE)) {
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
  private match(type: TokenType): boolean {
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
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Advances to the next token and returns the previous one
   * @returns The previous token
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * Checks if we've reached the end of the tokens
   * @returns True if we're at the end
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Gets the current token without advancing
   * @returns The current token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Gets the previous token
   * @returns The previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Consumes the current token if it matches the expected type
   * @param type Expected token type
   * @param message Error message if the token doesn't match
   * @returns The consumed token
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`Line ${this.peek().line}: ${message}`);
  }
}
