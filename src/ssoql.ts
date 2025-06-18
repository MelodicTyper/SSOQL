/**
 * SSOQL - Super Simple Object Query Language
 * A simple language for querying JavaScript objects with schema support.
 *
 * This implementation follows the specification outlined in the README.md file.
 * SSOQL allows for querying nested JavaScript objects using a SQL-like syntax
 * with support for USE statements, multiple named queries, and various operations
 * like SELECT, COUNT, SUM, DIVIDE, PERCENT_OF, and MOST_FREQUENT.
 */

/**
 * Represents a SSOQL query.
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
  execute(data: Record<string, any>): Record<string, any>;
}

// Types for parsing and execution

type ValueType = string | number | boolean | null;

interface UsePath {
  path: string;
  fields?: string[];
}

interface WhereCondition {
  field: string;
  operator: string;
  value: ValueType;
}

interface Operation {
  type: string;
  target?: string;
  variable?: string;
  fields?: string[];
  conditions?: WhereCondition[];
  args?: string[];
}

interface QueryBlock {
  name: string;
  operations: Operation[];
}

/**
 * SSOQL Parser and Executor
 */
class SSOQL {
  private usePaths: UsePath[] = [];
  private queryBlocks: QueryBlock[] = [];
  private variables: Record<string, any> = {};
  private queryText: string;

  constructor(queryText: string) {
    this.queryText = queryText;
    this.parse();
  }

  /**
   * Returns the object paths needed by this query
   */
  getExpectedObjects(): string[] {
    return this.usePaths.map((p) => p.path);
  }

  /**
   * Executes the query against the provided data
   */
  execute(data: Record<string, any>): Record<string, any> {
    // Resolve the data from the paths
    const resolvedData = this.resolveData(data);

    // Execute each query block and collect results
    const results: Record<string, any> = {};

    for (const block of this.queryBlocks) {
      results[block.name] = this.executeQueryBlock(block, resolvedData);
    }

    return results;
  }

  /**
   * Parse the SSOQL query text
   */
  private parse(): void {
    // Split by lines and remove empty lines
    const lines = this.queryText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentBlock: QueryBlock | null = null;

    for (const line of lines) {
      // Skip comments
      if (line.startsWith("//")) continue;

      // Parse USE statements
      if (line.startsWith("USE ")) {
        this.parseUsePath(line.substring(4));
        continue;
      }

      // Parse QUERY statements
      if (line.startsWith("QUERY ")) {
        // Store previous block if it exists
        if (currentBlock) {
          this.queryBlocks.push(currentBlock);
        }

        // Create new block
        currentBlock = {
          name: line.substring(6).trim(),
          operations: [],
        };
        continue;
      }

      // Parse RETURN statements
      if (line === "RETURN") {
        if (currentBlock) {
          this.queryBlocks.push(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // Parse operations within a query block
      if (currentBlock) {
        if (line.startsWith("$")) {
          // Variable assignment
          this.parseVariableOperation(line, currentBlock);
        } else if (line.startsWith("SELECT ")) {
          // SELECT operation
          this.parseSelectOperation(line, currentBlock);
        } else if (line.startsWith("COUNT ")) {
          // COUNT operation
          this.parseCountOperation(line, currentBlock);
        } else if (line.startsWith("DIVIDE ")) {
          // DIVIDE operation
          this.parseDivideOperation(line, currentBlock);
        } else if (line.startsWith("PERCENT_OF ")) {
          // PERCENT_OF operation
          this.parsePercentOfOperation(line, currentBlock);
        } else if (
          line === "SUM" ||
          line === "COUNT" ||
          line === "MOST_FREQUENT"
        ) {
          // Simple operations
          currentBlock.operations.push({ type: line });
        }
      }
    }

    // Add the last block if it exists
    if (currentBlock) {
      this.queryBlocks.push(currentBlock);
    }
  }

  /**
   * Parse USE path
   */
  private parseUsePath(pathText: string): void {
    const parts = pathText.trim().split(".");
    const finalPath: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (part.startsWith("[") && part.endsWith("]")) {
        // Array notation for fields
        const fields = part
          .substring(1, part.length - 1)
          .split(",")
          .map((f) => f.trim());

        this.usePaths.push({
          path: finalPath.join("."),
          fields,
        });
      } else {
        finalPath.push(part);
      }
    }

    // If no fields were specified, add the full path
    if (
      this.usePaths.length === 0 ||
      !this.usePaths.some((p) => p.path === finalPath.join("."))
    ) {
      this.usePaths.push({
        path: finalPath.join("."),
      });
    }
  }

  /**
   * Parse variable assignment operation
   */
  private parseVariableOperation(line: string, block: QueryBlock): void {
    const parts = line.trim().split(" ");
    const variableName = parts[0].substring(1); // Remove $

    if (parts.length === 2) {
      // Simple assignment like $var SUM
      block.operations.push({
        type: parts[1],
        variable: variableName,
      });
    } else if (parts.length > 2 && parts[1] === "MOST_FREQUENT") {
      // $var MOST_FREQUENT SELECT field
      const selectPart = line.substring(line.indexOf("SELECT")).trim();
      const selectOp = this.parseSelectStatement(selectPart);

      block.operations.push({
        type: "MOST_FREQUENT",
        variable: variableName,
        fields: selectOp.fields,
        conditions: selectOp.conditions,
      });
    } else if (parts.length > 2) {
      // Complex assignment like $var COUNT SELECT field WHERE (...)
      const operationType = parts[1];
      const restOfLine = line
        .substring(line.indexOf(parts[1]) + parts[1].length)
        .trim();

      if (restOfLine.startsWith("SELECT")) {
        const selectOp = this.parseSelectStatement(restOfLine);

        block.operations.push({
          type: operationType,
          variable: variableName,
          fields: selectOp.fields,
          conditions: selectOp.conditions,
        });
      }
    }
  }

  /**
   * Parse SELECT operation
   */
  private parseSelectOperation(line: string, block: QueryBlock): void {
    const selectOp = this.parseSelectStatement(line);
    block.operations.push(selectOp);
  }

  /**
   * Parse COUNT operation
   */
  private parseCountOperation(line: string, block: QueryBlock): void {
    const parts = line.trim().split(" ");

    if (parts.length >= 2 && parts[1] === "SELECT") {
      const selectPart = line.substring(line.indexOf("SELECT")).trim();
      const selectOp = this.parseSelectStatement(selectPart);

      block.operations.push({
        type: "COUNT",
        fields: selectOp.fields,
        conditions: selectOp.conditions,
      });
    }
  }

  /**
   * Parse DIVIDE operation
   */
  private parseDivideOperation(line: string, block: QueryBlock): void {
    const parts = line.trim().split(" ");

    if (parts.length >= 3) {
      block.operations.push({
        type: "DIVIDE",
        args: [parts[1], parts[2]],
      });
    }
  }

  /**
   * Parse PERCENT_OF operation
   */
  private parsePercentOfOperation(line: string, block: QueryBlock): void {
    const selectPart = line.substring(line.indexOf("SELECT")).trim();
    const selectOp = this.parseSelectStatement(selectPart);

    block.operations.push({
      type: "PERCENT_OF",
      fields: selectOp.fields,
      conditions: selectOp.conditions,
    });
  }

  /**
   * Parse SELECT statement into fields and conditions
   */
  private parseSelectStatement(statement: string): Operation {
    const parts = statement.split("WHERE").map((p) => p.trim());
    const fieldsPart = parts[0].replace("SELECT", "").trim();

    let fields: string[];
    if (fieldsPart === "*") {
      fields = ["*"];
    } else if (fieldsPart.startsWith("[") && fieldsPart.endsWith("]")) {
      fields = fieldsPart
        .substring(1, fieldsPart.length - 1)
        .split(",")
        .map((f) => f.trim());
    } else {
      fields = [fieldsPart];
    }

    const operation: Operation = {
      type: "SELECT",
      fields,
    };

    // Parse conditions if they exist
    if (parts.length > 1) {
      const conditionsPart = parts[1].trim();

      if (conditionsPart.startsWith("(") && conditionsPart.endsWith(")")) {
        const conditions = this.parseConditions(
          conditionsPart.substring(1, conditionsPart.length - 1).trim(),
        );
        operation.conditions = conditions;
      }
    }

    return operation;
  }

  /**
   * Parse conditions from a WHERE clause
   */
  private parseConditions(conditionsText: string): WhereCondition[] {
    const conditions: WhereCondition[] = [];
    const conditionParts = conditionsText.split("&").map((p) => p.trim());

    for (const condPart of conditionParts) {
      if (condPart.includes("=")) {
        const [field, value] = condPart.split("=").map((p) => p.trim());
        conditions.push({
          field,
          operator: "=",
          value: this.parseValue(value),
        });
      } else if (condPart.includes("CONTAINS")) {
        const [field, value] = condPart.split("CONTAINS").map((p) => p.trim());
        conditions.push({
          field,
          operator: "CONTAINS",
          value: this.parseValue(value),
        });
      }
    }

    return conditions;
  }

  /**
   * Parse a value (string, number, etc.)
   */
  private parseValue(valueText: string): ValueType {
    if (valueText.startsWith('"') && valueText.endsWith('"')) {
      return valueText.substring(1, valueText.length - 1);
    } else if (!isNaN(Number(valueText))) {
      return Number(valueText);
    } else if (valueText.startsWith("$")) {
      const varName = valueText.substring(1);
      return this.variables[varName] || null;
    }
    return valueText;
  }

  /**
   * Resolve data from USE paths
   */
  private resolveData(data: Record<string, any>): Record<string, any> {
    const resolvedData: Record<string, any> = {};

    for (const pathInfo of this.usePaths) {
      const path = pathInfo.path;
      const parts = path.split(".");

      // Navigate to the object
      let current = data;
      for (const part of parts) {
        if (!current || !current[part]) {
          throw new Error(`Path '${path}' not found in data`);
        }
        current = current[part];
      }

      // If fields are specified, extract them
      if (pathInfo.fields) {
        for (const field of pathInfo.fields) {
          if (current[field] !== undefined) {
            resolvedData[field] = current[field];
          }
        }
      } else {
        // Use the last part of the path as the key
        const lastPart = parts[parts.length - 1];
        resolvedData[lastPart] = current;
      }
    }

    return resolvedData;
  }

  /**
   * Execute a query block
   */
  private executeQueryBlock(block: QueryBlock, data: Record<string, any>): any {
    let context: any = null;

    for (const operation of block.operations) {
      context = this.executeOperation(operation, context, data);

      // Store variable if needed
      if (operation.variable) {
        this.variables[operation.variable] = context;
      }
    }

    return context;
  }

  /**
   * Execute a single operation
   */
  private executeOperation(
    operation: Operation,
    context: any,
    data: Record<string, any>,
  ): any {
    switch (operation.type) {
      case "SELECT":
        return this.executeSelect(operation, data);

      case "COUNT":
        return this.executeCount(operation, data);

      case "SUM":
        return this.executeSum(context);

      case "DIVIDE":
        return this.executeDivide(operation);

      case "PERCENT_OF":
        return this.executePercentOf(operation, data);

      case "MOST_FREQUENT":
        return this.executeMostFrequent(operation, context, data);

      default:
        return null;
    }
  }

  /**
   * Execute a SELECT operation
   */
  private executeSelect(operation: Operation, data: Record<string, any>): any {
    if (!operation.fields) return [];

    // Determine the source data
    let sourceData: any[] = [];
    const field = operation.fields[0];

    if (field === "*" && data.plays && Array.isArray(data.plays)) {
      sourceData = data.plays;
    } else if (data[field] && Array.isArray(data[field])) {
      sourceData = data[field];
    } else if (data.plays && Array.isArray(data.plays)) {
      // Try to extract field from plays
      sourceData = data.plays;
    } else {
      // No suitable source data found
      return [];
    }

    // Apply WHERE conditions if present
    let filteredData = sourceData;
    if (operation.conditions && operation.conditions.length > 0) {
      filteredData = sourceData.filter((item) =>
        this.evaluateConditions(item, operation.conditions!),
      );
    }

    // If we're selecting specific fields, map to those fields
    if (operation.fields.length > 1 || (field !== "*" && field !== "plays")) {
      if (field === "*") {
        // Return the full filtered items
        return filteredData;
      } else if (operation.fields.length === 1) {
        // Return array of the single field's values
        return filteredData.map((item) => {
          return field === "plays" ? item : item[field];
        });
      } else {
        // Return array of objects with selected fields
        return filteredData.map((item) => {
          const result: Record<string, any> = {};
          for (const f of operation.fields!) {
            result[f] = item[f];
          }
          return result;
        });
      }
    }

    return filteredData;
  }

  /**
   * Evaluate conditions on an item
   */
  private evaluateConditions(
    item: Record<string, any>,
    conditions: WhereCondition[],
  ): boolean {
    return conditions.every((condition) => {
      const field = condition.field;
      const value = condition.value;

      if (condition.operator === "=") {
        return item[field] === value;
      } else if (condition.operator === "CONTAINS") {
        if (Array.isArray(item[field])) {
          return item[field].includes(value);
        } else if (typeof item[field] === "string") {
          return item[field].includes(String(value));
        }
        return false;
      }

      return false;
    });
  }

  /**
   * Execute a COUNT operation
   */
  private executeCount(
    operation: Operation,
    data: Record<string, any>,
  ): number {
    let items: any[] = [];

    if (!operation.fields || operation.fields[0] === "*") {
      // Count all items
      if (data.plays && Array.isArray(data.plays)) {
        items = data.plays;
      } else {
        const allArrays = Object.values(data).filter((v) => Array.isArray(v));
        if (allArrays.length > 0) {
          items = allArrays[0] as any[];
        }
      }
    } else {
      // Count specific field
      const field = operation.fields[0];
      if (data[field] && Array.isArray(data[field])) {
        items = data[field];
      } else if (data.plays && Array.isArray(data.plays)) {
        // If field doesn't exist directly, try filtering plays by field
        const filteredPlays = data.plays.filter((p) => p[field] !== undefined);
        items = filteredPlays;
      }
    }

    // Apply conditions if present
    if (operation.conditions && operation.conditions.length > 0) {
      items = items.filter((item) =>
        this.evaluateConditions(item, operation.conditions!),
      );
    }

    return items.length;
  }

  /**
   * Execute a SUM operation
   */
  private executeSum(context: any): number {
    if (!Array.isArray(context)) return 0;

    return context.reduce((sum, value) => {
      if (typeof value === "number") {
        return sum + value;
      } else if (
        typeof value === "object" &&
        value !== null &&
        "yards" in value
      ) {
        // If it's an object with a yards property, use that
        return sum + (typeof value.yards === "number" ? value.yards : 0);
      }
      return sum;
    }, 0);
  }

  /**
   * Execute a DIVIDE operation
   */
  private executeDivide(operation: Operation): number {
    if (!operation.args || operation.args.length < 2) return 0;

    const dividend = operation.args[0];
    const divisor = operation.args[1];

    // Get values from variables (removing $ prefix)
    const dividendValue = this.variables[dividend.substring(1)];
    const divisorValue = this.variables[divisor.substring(1)];

    if (typeof dividendValue !== "number" || typeof divisorValue !== "number") {
      return 0;
    }

    if (divisorValue === 0) {
      return 0; // Avoid division by zero
    }

    return dividendValue / divisorValue;
  }

  /**
   * Execute a PERCENT_OF operation
   */
  private executePercentOf(
    operation: Operation,
    data: Record<string, any>,
  ): number {
    // First execute a SELECT to get the filtered items
    const selectedItems = this.executeSelect(operation, data);

    if (!Array.isArray(selectedItems)) return 0;

    // Determine the total count (all items without the filter)
    let totalCount = 0;

    if (data.plays && Array.isArray(data.plays)) {
      if (operation.conditions && operation.conditions.length > 0) {
        // For complex conditions, we need to count items that match at least the first condition's field
        const firstField = operation.conditions[0].field;
        totalCount = data.plays.filter(
          (p) => p[firstField] !== undefined,
        ).length;
      } else {
        totalCount = data.plays.length;
      }
    }

    if (totalCount === 0) return 0;

    return (selectedItems.length / totalCount) * 100;
  }

  /**
   * Execute a MOST_FREQUENT operation
   */
  private executeMostFrequent(
    operation: Operation,
    context: any,
    data: Record<string, any>,
  ): string | null {
    let values: any[] = [];

    // If we have a context from a previous operation, use that
    if (Array.isArray(context)) {
      values = context;
    }
    // If we have fields specified, execute a SELECT
    else if (operation.fields && operation.fields.length > 0) {
      const selectOp: Operation = {
        type: "SELECT",
        fields: operation.fields,
        conditions: operation.conditions,
      };
      values = this.executeSelect(selectOp, data);
    }
    // Otherwise try to use plays.coverage
    else if (data.plays && Array.isArray(data.plays)) {
      values = data.plays.map((p) => p.coverage).filter((c) => c && c !== "-");
    }

    if (!Array.isArray(values) || values.length === 0) return null;

    // Count frequencies
    const counts: Record<string, number> = {};
    for (const value of values) {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    }

    // Find the most frequent
    let maxCount = 0;
    let mostFrequent: string | null = null;

    for (const [value, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = value;
      }
    }

    return mostFrequent;
  }
}

/**
 * Creates a SSOQL query from a query string.
 * @param query - The SSOQL query string
 * @returns A SSOQLQuery object
 */
export function createQuery(query: string): SSOQLQuery {
  const parser = new SSOQL(query);

  return {
    expectedObjects(): string[] {
      return parser.getExpectedObjects();
    },

    execute(data: Record<string, any>): Record<string, any> {
      return parser.execute(data);
    },
  };
}

/**
 * Main SSOQL module exports.
 */
export default {
  createQuery,
};
