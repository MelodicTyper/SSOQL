/**
 * SSOQL - Super Simple Object Query Language
 * Executor
 */

import {
  ASTNode,
  BinaryConditionNode,
  ComparisonConditionNode,
  ConditionNode,
  CountOperationNode,
  DivideOperationNode,
  ExecutionContext,
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
  UnaryConditionNode,
  UsePathNode,
  ValueType,
  VariableAssignmentNode,
} from "../types/types";

/**
 * Executor class for SSOQL
 * Executes the AST and produces results
 */
export class Executor {
  private program: ProgramNode;
  private data: Record<string, any>;
  private variables: Map<string, any> = new Map();
  private usePaths: UsePathNode[] = [];

  
  
  /**
   * Creates a new executor
   * @param program The AST program to execute
   * @param data The data object to query
   */
  constructor(program: ProgramNode, data: Record<string, any>) {
    this.program = program;
    this.data = data;
    this.usePaths = program.usePaths;
    
  }

  /**
   * Executes the program and returns the results
   * @returns Results object with query results
   */
  execute(): Record<string, ValueType> {
    const results: Record<string, ValueType> = {};

    // Execute each query block
    for (const queryBlock of this.program.queryBlocks) {
      // Create context for this query
      const queryContext = this.createContextForQuery(queryBlock);

      // Execute the query block and store results
      results[queryBlock.name] = this.executeQueryBlock(
        queryBlock,
        queryContext,
      );
    }

    return results;
  }

  /**
   * Creates an execution context for a query
   * @param queryBlock The query block to create context for
   * @returns Execution context
   */
  private createContextForQuery(queryBlock: QueryBlockNode): ExecutionContext {
    const context: ExecutionContext = {
      data: this.data,
      variables: new Map(this.variables), // Clone variables to avoid cross-query interference
      currentContext: [],
    };

    // Resolve data for this query based on USE paths
    context.currentContext = this.resolveDataFromUsePaths();
    
    return context;
  }

  /**
   * Resolves data from USE paths
   * @returns Array of data objects
   */
  private resolveDataFromUsePaths(): any[] {
    if (this.usePaths.length === 0) {
      return [];
    }

    const resolvedData: any[] = [];
    
    for (const usePath of this.usePaths) {
      const pathParts = usePath.path.split(".");
      
      // Start from the root data object
      let currentData = this.data;

      // Traverse the path
      for (const part of pathParts) {
        if (!currentData[part]) {
          // Path doesn't exist
          break;
        }
        currentData = currentData[part];
      }

      // Extract fields if specified
      if (Array.isArray(currentData)) {
        // If currentData is an array, process each item
        if (usePath.fields) {
          const filteredData = currentData.map((item) => {
            const result: Record<string, any> = {};
            for (const field of usePath.fields!) {
              if (item[field] !== undefined) {
                result[field] = item[field];
              }
            }
            return result;
          });
          resolvedData.push(...filteredData);
        } else {
          resolvedData.push(...currentData);
        }
      } else if (typeof currentData === "object" && currentData !== null) {
        // If currentData is an object
        if (usePath.fields) {
          const result: Record<string, any> = {};
          for (const field of usePath.fields) {
            if (currentData[field] !== undefined) {
              result[field] = currentData[field];
            }
          }
          resolvedData.push(result);
        } else {
          resolvedData.push(currentData);
        }
      }
    }
    //console.log(resolvedData)
    return resolvedData;
  }

  /**
   * Executes a query block
   * @param queryBlock The query block to execute
   * @param context The execution context
   * @returns Query result
   */
  private executeQueryBlock(
    queryBlock: QueryBlockNode,
    context: ExecutionContext,
  ): ValueType {
    let result: any = null;

    // Execute each operation in sequence
    for (const operation of queryBlock.operations) {
      result = this.executeOperation(operation, context);
    }
    return result;
  }

  /**
   * Executes an operation
   * @param operation The operation to execute
   * @param context The execution context
   * @returns Operation result
   */
  private executeOperation(
    operation: OperationNode,
    context: ExecutionContext,
  ): any {
    switch (operation.type) {
      case "SelectOperation":
        return this.executeSelect(operation as SelectOperationNode, context);

      case "CountOperation":
        return this.executeCount(operation as CountOperationNode, context);

      case "SumOperation":
        return this.executeSum(context);

      case "DivideOperation":
        return this.executeDivide(operation as DivideOperationNode, context);

      case "MultiplyOperation":
        return this.executeMultiply(
          operation as MultiplyOperationNode,
          context,
        );

      case "SubtractOperation":
        return this.executeSubtract(
          operation as SubtractOperationNode,
          context,
        );

      case "AverageOperation":
        return this.executeAverage(context);

      case "MedianOperation":
        return this.executeMedian(context);

      case "MinOperation":
        return this.executeMin(context);

      case "MaxOperation":
        return this.executeMax(context);

      case "PercentOfOperation":
        return this.executePercentOf(
          operation as PercentOfOperationNode,
          context,
        );

      case "MostFrequentOperation":
        return this.executeMostFrequent(context);

      case "LeastFrequentOperation":
        return this.executeLeastFrequent(context);

      case "UniqueOperation":
        return this.executeUnique(context);

      case "StandardDeviationOperation":
        return this.executeStandardDeviation(context);

      case "VarianceOperation":
        return this.executeVariance(context);

      case "RangeOperation":
        return this.executeRange(context);

      case "VariableAssignment":
        return this.executeVariableAssignment(
          operation as VariableAssignmentNode,
          context,
        );

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Executes a SELECT operation
   * @param operation The SELECT operation
   * @param context The execution context
   * @returns Selection result
   */
  private executeSelect(
    operation: SelectOperationNode,
    context: ExecutionContext,
  ): any[] | ValueType[] {
    let result: any[] = [];

    // TODO implement this right
    // 
    // First find if the field has multiple possible paths for the query to execute on for USE y2025.[w1, w2].O.play
    // We need to have a tree of every single object. When we select a certain key, like play, we need to search the entire tree and find each instance of that key 
    // If there's more than one in our USE tree, then we return an array of possibilities. Each subsequent operation in the context will perform on each of those possibilities.
    // A return will return the query with an object of possbilities with the key to each being a branch in that tree
    // 
    // So we need:
    // 0. Update the test file to test for our end goal.
    // 1. Tree of each object key implemented in the find use path thingy
    // 2. Update that arrays of objects are NOT allowed in SSOQL, arrays of things can only be of supported fields like strings, numbers, and booleans. Update the tests to match this
    // 3. Refine how the current context data is used. Why is it sometimes object and sometimes array? Implement these changes within each function that expects the current context to be like that
    // 4. Refine the return statement and how it deals with possibilities. 
    // 5. Get sucessful tests for these simple features, then test the rest of the language.
    // 
    // This is definetly the most interesting problem in this language. Might be a challenge to solve
    
    // Each select statement wipes the current context clean
    context.currentContext = [];

    // Apply WHERE filter if present
    if (operation.conditions) {
      result = result.filter((item) =>
        this.evaluateCondition(operation.conditions!, item, context),
      );
    }

    // Extract requested fields
    if (operation.fields !== "*") {
      if (operation.fields.length === 1) {
        // If only one field is requested, return an array of primitive values
        const field = operation.fields[0];
        result = result.map((item) => {
          const value = item[field];
          // Ensure the value is a primitive
          if (
            value === null ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            return value;
          } else if (Array.isArray(value) || typeof value === "object") {
            // Convert arrays and objects to JSON strings
            return JSON.stringify(value);
          } else {
            // Convert any other type to string
            return String(value);
          }
        });
      } else {
        // If multiple fields are requested, return JSON strings of objects with just those fields
        result = result.map((item) => {
          const projection: Record<string, any> = {};
          for (const field of operation.fields as string[]) {
            const value = item[field];
            // Ensure nested values are also primitives
            if (
              value === null ||
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              projection[field] = value;
            } else if (Array.isArray(value) || typeof value === "object") {
              projection[field] = JSON.stringify(value);
            } else {
              projection[field] = String(value);
            }
          }
          return JSON.stringify(projection);
        });
      }
    } else {
      // When selecting all fields, convert objects to JSON strings
      result = result.map((item) => JSON.stringify(item));
    }

    // Update context with the selection result
    context.currentContext = result;

    return result;
  }

  /**
   * Executes a COUNT operation
   * @param operation The COUNT operation
   * @param context The execution context
   * @returns Count result
   */
  private executeCount(
    operation: CountOperationNode,
    context: ExecutionContext,
  ): number {
    

    // Save original context
    const originalContext = [...context.currentContext];

    // Execute the SELECT operation inside the COUNT
    const selectResult = this.executeSelect(operation.selectOperation, {
      ...context,
      currentContext: [...originalContext],
    });

    // Restore original context
    context.currentContext = originalContext;

    // Return the count of items
    return selectResult.length;
  }

  /**
   * Executes a SUM operation
   * @param context The execution context
   * @returns Sum result
   */
  private executeSum(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return 0;
    }

    // If the context contains primitive values, sum them directly
    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      return currentContext.reduce((sum, value) => {
        const numValue = Number(value);
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
    }

    // If the context contains objects with a single property, sum that property
    const firstItem = currentContext[0];
    const keys = Object.keys(firstItem);

    if (keys.length === 1) {
      const key = keys[0];
      return currentContext.reduce((sum, item) => {
        const value = Number(item[key]);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
    }

    // Cannot sum objects with multiple properties
    throw new Error("Cannot sum objects with multiple properties");
  }

  /**
   * Executes a DIVIDE operation
   * @param operation The DIVIDE operation
   * @param context The execution context
   * @returns Division result
   */
  private executeDivide(
    operation: DivideOperationNode,
    context: ExecutionContext,
  ): number {
    // TODO make divide work on other types of values and with 1 parameter
    const dividend = this.getVariableValue(operation.dividend, context);
    const divisor = this.getVariableValue(operation.divisor, context);

    if (divisor === 0) {
      return 0; // Avoid division by zero
    }

    return dividend / divisor;
  }

  /**
   * Executes a MULTIPLY operation
   * @param operation The MULTIPLY operation
   * @param context The execution context
   * @returns Multiplication result
   */
  private executeMultiply(
    operation: MultiplyOperationNode,
    context: ExecutionContext,
  ): number {
    // TODO same thing as divide
    const factor1 = this.getVariableValue(operation.factor1, context);
    const factor2 = this.getVariableValue(operation.factor2, context);

    return factor1 * factor2;
  }

  /**
   * Executes a SUBTRACT operation
   * @param operation The SUBTRACT operation
   * @param context The execution context
   * @returns Subtraction result
   */
  private executeSubtract(
    operation: SubtractOperationNode,
    context: ExecutionContext,
  ): number {
    // TODO same exact thing here
    const minuend = this.getVariableValue(operation.minuend, context);
    const subtrahend = this.getVariableValue(operation.subtrahend, context);

    return minuend - subtrahend;
  }

  /**
   * Executes an AVERAGE operation
   * @param context The execution context
   * @returns Average result
   */
  private executeAverage(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return 0;
    }

    const sum = this.executeSum(context);
    return sum / currentContext.length;
  }

  /**
   * Executes a MEDIAN operation
   * @param context The execution context
   * @returns Median result
   */
  private executeMedian(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return 0;
    }

    // Extract numeric values
    let values: number[] = [];

    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      values = currentContext
        .map((value) => Number(value))
        .filter((value) => !isNaN(value));
    } else {
      const firstItem = currentContext[0];
      const keys = Object.keys(firstItem);

      if (keys.length === 1) {
        const key = keys[0];
        values = currentContext
          .map((item) => Number(item[key]))
          .filter((value) => !isNaN(value));
      } else {
        throw new Error(
          "Cannot calculate median of objects with multiple properties",
        );
      }
    }

    if (values.length === 0) {
      return 0;
    }

    // Sort values
    values.sort((a, b) => a - b);

    // Find median
    const mid = Math.floor(values.length / 2);
    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      return values[mid];
    }
  }

  /**
   * Executes a MIN operation
   * @param context The execution context
   * @returns Minimum result
   */
  private executeMin(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return 0;
    }

    // Extract numeric values
    let values: number[] = [];

    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      values = currentContext
        .map((value) => Number(value))
        .filter((value) => !isNaN(value));
    } else {
      const firstItem = currentContext[0];
      const keys = Object.keys(firstItem);

      if (keys.length === 1) {
        const key = keys[0];
        values = currentContext
          .map((item) => Number(item[key]))
          .filter((value) => !isNaN(value));
      } else {
        throw new Error(
          "Cannot find minimum of objects with multiple properties",
        );
      }
    }

    if (values.length === 0) {
      return 0;
    }

    return Math.min(...values);
  }

  /**
   * Executes a MAX operation
   * @param context The execution context
   * @returns Maximum result
   */
  private executeMax(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return 0;
    }

    // Extract numeric values
    let values: number[] = [];

    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      values = currentContext
        .map((value) => Number(value))
        .filter((value) => !isNaN(value));
    } else {
      const firstItem = currentContext[0];
      const keys = Object.keys(firstItem);

      if (keys.length === 1) {
        const key = keys[0];
        values = currentContext
          .map((item) => Number(item[key]))
          .filter((value) => !isNaN(value));
      } else {
        throw new Error(
          "Cannot find maximum of objects with multiple properties",
        );
      }
    }

    if (values.length === 0) {
      return 0;
    }

    return Math.max(...values);
  }

  /**
   * Executes a PERCENT_OF operation
   * @param operation The PERCENT_OF operation
   * @param context The execution context
   * @returns Percentage result
   */
  private executePercentOf(
    operation: PercentOfOperationNode,
    context: ExecutionContext,
  ): number {
    try {
      
      // Save current context
      const originalContext = [...context.currentContext];

      // Create a deep copy of the context to avoid side effects
      const contextCopy = {
        data: context.data,
        variables: new Map(context.variables),
        currentContext: [...originalContext],
      };

      // Execute numerator SELECT with its own context
      const numeratorContext = { ...contextCopy };
      const numeratorResult = this.executeSelect(
        operation.numerator,
        numeratorContext,
      );

      // Execute denominator SELECT with its own context
      const denominatorContext = { ...contextCopy };
      const denominatorResult = this.executeSelect(
        operation.denominator,
        denominatorContext,
      );

      // Calculate percentage
      if (denominatorResult.length === 0) {
        return 0;
      }

      const percentage =
        (numeratorResult.length / denominatorResult.length) * 100;

      // Restore original context
      context.currentContext = originalContext;

      return percentage;
    } catch (error) {
      console.error("Error in PERCENT_OF operation:", error);
      return 0;
    }
  }

  /**
   * Executes a MOST_FREQUENT operation
   * @param context The execution context
   * @returns Most frequent value
   */
  private executeMostFrequent(context: ExecutionContext): any {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return null;
    }

    // Count frequencies
    const frequencies: Map<string, { count: number; value: any }> = new Map();

    for (const item of currentContext) {
      let value: any;

      if (typeof item !== "object" || item === null) {
        value = item;
      } else {
        const keys = Object.keys(item);
        if (keys.length === 1) {
          value = item[keys[0]];
        } else {
          throw new Error(
            "Cannot find most frequent value of objects with multiple properties",
          );
        }
      }

      // Skip null and undefined
      if (value === null || value === undefined) {
        continue;
      }

      const key = String(value);

      if (frequencies.has(key)) {
        frequencies.get(key)!.count++;
      } else {
        frequencies.set(key, { count: 1, value });
      }
    }

    if (frequencies.size === 0) {
      return null;
    }

    // Find most frequent
    let maxCount = 0;
    let mostFrequent: any = null;

    for (const entry of frequencies.values()) {
      if (entry.count > maxCount) {
        maxCount = entry.count;
        mostFrequent = entry.value;
      }
    }

    return mostFrequent;
  }

  /**
   * Executes a LEAST_FREQUENT operation
   * @param context The execution context
   * @returns Least frequent value
   */
  private executeLeastFrequent(context: ExecutionContext): any {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return null;
    }

    // Count frequencies
    const frequencies: Map<string, { count: number; value: any }> = new Map();

    for (const item of currentContext) {
      let value: any;

      if (typeof item !== "object" || item === null) {
        value = item;
      } else {
        const keys = Object.keys(item);
        if (keys.length === 1) {
          value = item[keys[0]];
        } else {
          throw new Error(
            "Cannot find least frequent value of objects with multiple properties",
          );
        }
      }

      // Skip null and undefined
      if (value === null || value === undefined) {
        continue;
      }

      const key = String(value);

      if (frequencies.has(key)) {
        frequencies.get(key)!.count++;
      } else {
        frequencies.set(key, { count: 1, value });
      }
    }

    if (frequencies.size === 0) {
      return null;
    }

    // Find least frequent
    let minCount = Infinity;
    let leastFrequent: any = null;

    for (const entry of frequencies.values()) {
      if (entry.count < minCount) {
        minCount = entry.count;
        leastFrequent = entry.value;
      }
    }

    return leastFrequent;
  }

  /**
   * Executes a UNIQUE operation
   * @param context The execution context
   * @returns Array of unique values
   */
  private executeUnique(context: ExecutionContext): any[] {
    const currentContext = context.currentContext;

    if (currentContext.length === 0) {
      return [];
    }

    // Extract values
    let values: any[] = [];

    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      values = currentContext;
    } else {
      const firstItem = currentContext[0];
      const keys = Object.keys(firstItem);

      if (keys.length === 1) {
        const key = keys[0];
        values = currentContext.map((item) => item[key]);
      } else {
        throw new Error(
          "Cannot find unique values of objects with multiple properties",
        );
      }
    }

    // Get unique values
    const uniqueValues = Array.from(
      new Set(values.filter((value) => value !== null && value !== undefined)),
    );

    return uniqueValues;
  }

  /**
   * Executes a STANDARD_DEVIATION operation
   * @param context The execution context
   * @returns Standard deviation result
   */
  private executeStandardDeviation(context: ExecutionContext): number {
    const variance = this.executeVariance(context);
    return Math.sqrt(variance);
  }

  /**
   * Executes a VARIANCE operation
   * @param context The execution context
   * @returns Variance result
   */
  private executeVariance(context: ExecutionContext): number {
    const currentContext = context.currentContext;

    if (currentContext.length <= 1) {
      return 0;
    }

    // Extract numeric values
    let values: number[] = [];

    if (typeof currentContext[0] !== "object" || currentContext[0] === null) {
      values = currentContext
        .map((value) => Number(value))
        .filter((value) => !isNaN(value));
    } else {
      const firstItem = currentContext[0];
      const keys = Object.keys(firstItem);

      if (keys.length === 1) {
        const key = keys[0];
        values = currentContext
          .map((item) => Number(item[key]))
          .filter((value) => !isNaN(value));
      } else {
        throw new Error(
          "Cannot calculate variance of objects with multiple properties",
        );
      }
    }

    if (values.length <= 1) {
      return 0;
    }

    // Calculate mean
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    // Calculate variance
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      (values.length - 1);

    return variance;
  }

  /**
   * Executes a RANGE operation
   * @param context The execution context
   * @returns Range result
   */
  private executeRange(context: ExecutionContext): number {
    const min = this.executeMin(context);
    const max = this.executeMax(context);

    return max - min;
  }

  /**
   * Executes a variable assignment
   * @param operation The variable assignment operation
   * @param context The execution context
   * @returns Assignment result
   */
  private executeVariableAssignment(
    operation: VariableAssignmentNode,
    context: ExecutionContext,
  ): any {
    const result = this.executeOperation(operation.operation, context);

    // Store the result in the variables map
    context.variables.set(operation.name, result);
    this.variables.set(operation.name, result); // Also store in global variables

    return result;
  }

  /**
   * Gets the value of a variable
   * @param variableName The name of the variable
   * @param context The execution context
   * @returns Variable value
   */
  private getVariableValue(
    variableName: string,
    context: ExecutionContext,
  ): any {
    if (!context.variables.has(variableName)) {
      throw new Error(`Variable ${variableName} not found`);
    }

    return context.variables.get(variableName);
  }

  /**
   * Evaluates a condition
   * @param condition The condition to evaluate
   * @param item The item to evaluate against
   * @param context The execution context
   * @returns True if the condition is met
   */
  private evaluateCondition(
    condition: ConditionNode,
    item: any,
    context: ExecutionContext,
  ): boolean {
    switch (condition.type) {
      case "BinaryCondition": {
        const binaryCondition = condition as BinaryConditionNode;

        if (binaryCondition.operator === OperatorType.AND) {
          return (
            this.evaluateCondition(binaryCondition.left, item, context) &&
            this.evaluateCondition(binaryCondition.right, item, context)
          );
        } else if (binaryCondition.operator === OperatorType.OR) {
          return (
            this.evaluateCondition(binaryCondition.left, item, context) ||
            this.evaluateCondition(binaryCondition.right, item, context)
          );
        }

        throw new Error(`Unknown binary operator: ${binaryCondition.operator}`);
      }

      case "UnaryCondition": {
        const binaryCondition = condition as UnaryConditionNode;

        if (binaryCondition.operator === OperatorType.NOT) {
          return !this.evaluateCondition(
            binaryCondition.condition,
            item,
            context,
          );
        }

        throw new Error(`Unknown unary operator: ${binaryCondition.operator}`);
      }

      case "ComparisonCondition": {
        const comparisonCondition = condition as ComparisonConditionNode;
        return this.evaluateComparison(comparisonCondition, item, context);
      }

      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }
  }

  /**
   * Evaluates a comparison condition
   * @param condition The comparison condition to evaluate
   * @param item The item to evaluate against
   * @param context The execution context
   * @returns True if the comparison is met
   */
  private evaluateComparison(
    condition: ComparisonConditionNode,
    item: any,
    context: ExecutionContext,
  ): boolean {
    const { field, operator, value } = condition;

    // Get the actual value to compare
    let actualValue = item[field];
    let compareValue = value;

    // If value is a variable reference (starts with $), resolve it
    if (typeof value === "string" && value.startsWith("$")) {
      compareValue = this.getVariableValue(value, context);
    }

    // Perform the comparison
    switch (operator) {
      case OperatorType.EQUALS:
        return actualValue == compareValue;

      case OperatorType.NOT_EQUALS:
        return actualValue != compareValue;

      case OperatorType.GREATER_THAN:
        return compareValue !== null && actualValue > compareValue;

      case OperatorType.LESS_THAN:
        return compareValue !== null && actualValue < compareValue;

      case OperatorType.GREATER_THAN_EQUALS:
        return compareValue !== null && actualValue >= compareValue;

      case OperatorType.LESS_THAN_EQUALS:
        return compareValue !== null && actualValue <= compareValue;

      case OperatorType.CONTAINS:
        return (
          Array.isArray(actualValue) &&
          actualValue.some((val) => String(val) === String(compareValue))
        );

      case OperatorType.NOT_CONTAINS:
        return (
          !Array.isArray(actualValue) ||
          !actualValue.some((val) => String(val) === String(compareValue))
        );

      default:
        throw new Error(`Unknown comparison operator: ${operator}`);
    }
  }
}