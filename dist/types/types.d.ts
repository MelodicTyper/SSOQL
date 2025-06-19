/**
 * SSOQL - Super Simple Object Query Language
 * Types definitions
 */
/**
 * Primitive value types supported in SSOQL
 */
export type ValueType = string | number | boolean | null;
/**
 * Token types for the lexer
 */
export declare enum TokenType {
    USE = "USE",
    QUERY = "QUERY",
    SELECT = "SELECT",
    WHERE = "WHERE",
    RETURN = "RETURN",
    COUNT = "COUNT",
    SUM = "SUM",
    DIVIDE = "DIVIDE",
    MULTIPLY = "MULTIPLY",
    SUBTRACT = "SUBTRACT",
    AVERAGE = "AVERAGE",
    MEDIAN = "MEDIAN",
    MIN = "MIN",
    MAX = "MAX",
    PERCENT_OF = "PERCENT_OF",
    MOST_FREQUENT = "MOST_FREQUENT",
    LEAST_FREQUENT = "LEAST_FREQUENT",
    UNIQUE = "UNIQUE",
    STANDARD_DEVIATION = "STANDARD_DEVIATION",
    VARIANCE = "VARIANCE",
    RANGE = "RANGE",
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    VARIABLE = "VARIABLE",
    ASTERISK = "ASTERISK",
    COMMA = "COMMA",
    DOT = "DOT",
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN",
    GREATER_THAN_EQUALS = "GREATER_THAN_EQUALS",
    LESS_THAN_EQUALS = "LESS_THAN_EQUALS",
    LEFT_BRACKET = "LEFT_BRACKET",
    RIGHT_BRACKET = "RIGHT_BRACKET",
    LEFT_PAREN = "LEFT_PAREN",
    RIGHT_PAREN = "RIGHT_PAREN",
    AMPERSAND = "AMPERSAND",
    PIPE = "PIPE",
    NOT = "NOT",
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    NULL = "NULL",
    COMMENT = "COMMENT",
    EOF = "EOF",
    UNKNOWN = "UNKNOWN"
}
/**
 * Token representation
 */
export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
/**
 * Operator types supported in conditions
 */
export declare enum OperatorType {
    EQUALS = "=",
    NOT_EQUALS = "!=",
    GREATER_THAN = ">",
    LESS_THAN = "<",
    GREATER_THAN_EQUALS = ">=",
    LESS_THAN_EQUALS = "<=",
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    AND = "&",
    OR = "|",
    NOT = "!"
}
/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
    type: string;
}
/**
 * Top-level SSOQL program node
 */
export interface ProgramNode extends ASTNode {
    type: "Program";
    usePaths: UsePathNode[];
    queryBlocks: QueryBlockNode[];
}
/**
 * USE statement node
 */
export interface UsePathNode extends ASTNode {
    type: "UsePath";
    path: string;
    fields?: string[];
}
/**
 * QUERY block node
 */
export interface QueryBlockNode extends ASTNode {
    type: "QueryBlock";
    name: string;
    operations: OperationNode[];
}
/**
 * Base interface for operation nodes
 */
export interface OperationNode extends ASTNode {
    type: string;
}
/**
 * SELECT operation node
 */
export interface SelectOperationNode extends OperationNode {
    type: "SelectOperation";
    fields: string[] | "*";
    conditions?: ConditionNode;
}
/**
 * COUNT operation node
 */
export interface CountOperationNode extends OperationNode {
    type: "CountOperation";
    selectOperation: SelectOperationNode;
}
/**
 * SUM operation node
 */
export interface SumOperationNode extends OperationNode {
    type: "SumOperation";
}
/**
 * DIVIDE operation node
 */
export interface DivideOperationNode extends OperationNode {
    type: "DivideOperation";
    dividend: string;
    divisor: string;
}
/**
 * MULTIPLY operation node
 */
export interface MultiplyOperationNode extends OperationNode {
    type: "MultiplyOperation";
    factor1: string;
    factor2: string;
}
/**
 * SUBTRACT operation node
 */
export interface SubtractOperationNode extends OperationNode {
    type: "SubtractOperation";
    minuend: string;
    subtrahend: string;
}
/**
 * AVERAGE operation node
 */
export interface AverageOperationNode extends OperationNode {
    type: "AverageOperation";
}
/**
 * MEDIAN operation node
 */
export interface MedianOperationNode extends OperationNode {
    type: "MedianOperation";
}
/**
 * MIN operation node
 */
export interface MinOperationNode extends OperationNode {
    type: "MinOperation";
}
/**
 * MAX operation node
 */
export interface MaxOperationNode extends OperationNode {
    type: "MaxOperation";
}
/**
 * PERCENT_OF operation node
 */
export interface PercentOfOperationNode extends OperationNode {
    type: "PercentOfOperation";
    numerator: SelectOperationNode;
    denominator: SelectOperationNode;
}
/**
 * MOST_FREQUENT operation node
 */
export interface MostFrequentOperationNode extends OperationNode {
    type: "MostFrequentOperation";
}
/**
 * LEAST_FREQUENT operation node
 */
export interface LeastFrequentOperationNode extends OperationNode {
    type: "LeastFrequentOperation";
}
/**
 * UNIQUE operation node
 */
export interface UniqueOperationNode extends OperationNode {
    type: "UniqueOperation";
}
/**
 * STANDARD_DEVIATION operation node
 */
export interface StandardDeviationOperationNode extends OperationNode {
    type: "StandardDeviationOperation";
}
/**
 * VARIANCE operation node
 */
export interface VarianceOperationNode extends OperationNode {
    type: "VarianceOperation";
}
/**
 * RANGE operation node
 */
export interface RangeOperationNode extends OperationNode {
    type: "RangeOperation";
}
/**
 * Variable assignment operation node
 */
export interface VariableAssignmentNode extends OperationNode {
    type: "VariableAssignment";
    name: string;
    operation: OperationNode;
}
/**
 * Condition node for WHERE clauses
 */
export interface ConditionNode extends ASTNode {
    type: string;
}
/**
 * Binary condition node (for AND, OR operations)
 */
export interface BinaryConditionNode extends ConditionNode {
    type: "BinaryCondition";
    operator: OperatorType.AND | OperatorType.OR;
    left: ConditionNode;
    right: ConditionNode;
}
/**
 * Unary condition node (for NOT operations)
 */
export interface UnaryConditionNode extends ConditionNode {
    type: "UnaryCondition";
    operator: OperatorType.NOT;
    condition: ConditionNode;
}
/**
 * Field comparison condition node
 */
export interface ComparisonConditionNode extends ConditionNode {
    type: "ComparisonCondition";
    field: string;
    operator: Exclude<OperatorType, OperatorType.AND | OperatorType.OR | OperatorType.NOT>;
    value: ValueType;
}
/**
 * Represents a path in the USE statement
 */
export interface UsePath {
    path: string;
    fields?: string[];
}
/**
 * Context for query execution
 */
export interface ExecutionContext {
    data: Record<string, any>;
    variables: Map<string, any>;
    currentContext: any[];
}
/**
 * Public interface for SSOQL query
 */
export interface SSOQLQuery {
    /**
     * Returns the names of objects expected by the query.
     */
    expectedObjects(): string[];
    /**
     * Executes the query against the provided data objects.
     * @param data - Object containing the data to query
     * @returns The query results as an object with query names as keys
     */
    execute(data: Record<string, any>): Record<string, ValueType>;
}
