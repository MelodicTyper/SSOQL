/**
 * SSOQL - Super Simple Object Query Language
 * Executor
 */
import { ProgramNode, ValueType } from "../types/types";
/**
 * Executor class for SSOQL
 * Executes the AST and produces results
 */
export declare class Executor {
    private program;
    private data;
    private variables;
    private usePaths;
    /**
     * Creates a new executor
     * @param program The AST program to execute
     * @param data The data object to query
     */
    constructor(program: ProgramNode, data: Record<string, any>);
    /**
     * Executes the program and returns the results
     * @returns Results object with query results
     */
    execute(): Record<string, ValueType>;
    /**
     * Creates an execution context for a query
     * @param queryBlock The query block to create context for
     * @returns Execution context
     */
    private createContextForQuery;
    /**
     * Resolves data from USE paths
     * @returns Array of data objects
     */
    private resolveDataFromUsePaths;
    /**
     * Executes a query block
     * @param queryBlock The query block to execute
     * @param context The execution context
     * @returns Query result
     */
    private executeQueryBlock;
    /**
     * Executes an operation
     * @param operation The operation to execute
     * @param context The execution context
     * @returns Operation result
     */
    private executeOperation;
    /**
     * Executes a SELECT operation
     * @param operation The SELECT operation
     * @param context The execution context
     * @returns Selection result
     */
    private executeSelect;
    /**
     * Executes a COUNT operation
     * @param operation The COUNT operation
     * @param context The execution context
     * @returns Count result
     */
    private executeCount;
    /**
     * Executes a SUM operation
     * @param context The execution context
     * @returns Sum result
     */
    private executeSum;
    /**
     * Executes a DIVIDE operation
     * @param operation The DIVIDE operation
     * @param context The execution context
     * @returns Division result
     */
    private executeDivide;
    /**
     * Executes a MULTIPLY operation
     * @param operation The MULTIPLY operation
     * @param context The execution context
     * @returns Multiplication result
     */
    private executeMultiply;
    /**
     * Executes a SUBTRACT operation
     * @param operation The SUBTRACT operation
     * @param context The execution context
     * @returns Subtraction result
     */
    private executeSubtract;
    /**
     * Executes an AVERAGE operation
     * @param context The execution context
     * @returns Average result
     */
    private executeAverage;
    /**
     * Executes a MEDIAN operation
     * @param context The execution context
     * @returns Median result
     */
    private executeMedian;
    /**
     * Executes a MIN operation
     * @param context The execution context
     * @returns Minimum result
     */
    private executeMin;
    /**
     * Executes a MAX operation
     * @param context The execution context
     * @returns Maximum result
     */
    private executeMax;
    /**
     * Executes a PERCENT_OF operation
     * @param operation The PERCENT_OF operation
     * @param context The execution context
     * @returns Percentage result
     */
    private executePercentOf;
    /**
     * Executes a MOST_FREQUENT operation
     * @param context The execution context
     * @returns Most frequent value
     */
    private executeMostFrequent;
    /**
     * Executes a LEAST_FREQUENT operation
     * @param context The execution context
     * @returns Least frequent value
     */
    private executeLeastFrequent;
    /**
     * Executes a UNIQUE operation
     * @param context The execution context
     * @returns Array of unique values
     */
    private executeUnique;
    /**
     * Executes a STANDARD_DEVIATION operation
     * @param context The execution context
     * @returns Standard deviation result
     */
    private executeStandardDeviation;
    /**
     * Executes a VARIANCE operation
     * @param context The execution context
     * @returns Variance result
     */
    private executeVariance;
    /**
     * Executes a RANGE operation
     * @param context The execution context
     * @returns Range result
     */
    private executeRange;
    /**
     * Executes a variable assignment
     * @param operation The variable assignment operation
     * @param context The execution context
     * @returns Assignment result
     */
    private executeVariableAssignment;
    /**
     * Gets the value of a variable
     * @param variableName The name of the variable
     * @param context The execution context
     * @returns Variable value
     */
    private getVariableValue;
    /**
     * Evaluates a condition
     * @param condition The condition to evaluate
     * @param item The item to evaluate against
     * @param context The execution context
     * @returns True if the condition is met
     */
    private evaluateCondition;
    /**
     * Evaluates a comparison condition
     * @param condition The comparison condition to evaluate
     * @param item The item to evaluate against
     * @param context The execution context
     * @returns True if the comparison is met
     */
    private evaluateComparison;
}
