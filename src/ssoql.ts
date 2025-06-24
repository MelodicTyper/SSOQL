/**
 * SSOQL - Super Simple Object Query Language
 * A simple language for querying JavaScript objects with schema support.
 *
 * This implementation follows the specification outlined in the README.md file.
 * SSOQL allows for querying nested JavaScript objects using a SQL-like syntax
 * with support for USE statements, multiple named queries, and various operations
 * like SELECT, COUNT, SUM, DIVIDE, PERCENT_OF, and MOST_FREQUENT.
 */

import { Tokenizer } from "./tokenizer/tokenizer";
import { Parser } from "./parser/parser";
import { Executor } from "./executor/executor";
import { SSOQLQuery, ProgramNode, ValueType } from "./types/types";
import { cloneDeep } from "lodash-es";
/**
 * SSOQL implementation class
 * Handles query creation and execution
 */
class SSOQL {
  /**
   * Creates a new SSOQL query from a query string
   * @param queryText The SSOQL query text
   * @returns A SSOQLQuery object that can be executed against data
   */
  createQuery(queryText: string): SSOQLQuery {
    
    // Parse the query into an AST
    const ast = this.parseQuery(queryText);
    return {
      /**
       * Returns the names of objects expected by the query
       */
      expectedObjects: (): string[] => {
        //console.log(ast.usePaths.map((usePath) => usePath.path))
        return ast.usePaths.map((usePath) => usePath.path);
      },

      /**
       * Executes the query against the provided data objects
       * @param data Object containing the data to query
       * @returns The query results as an object with query names as primitive values (string, number, boolean)
       */
      execute: (
        data: Record<string, any>,
      ): Record<string, string | number | boolean | null> => {
        // Execute the query
        const executor = new Executor(ast, data);
        const results = executor.execute();

        // Convert any non-primitive values to strings
        const sanitizedResults: Record<
          string,
          string | number | boolean | null
        > = {};
        for (const key in results) {
          const value = results[key];
          if (
            value === null ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            sanitizedResults[key] = value;
          } else {
            // Convert objects and arrays to string representation
            sanitizedResults[key] = JSON.stringify(value);
          }
        }

        return sanitizedResults;
      },
    };
  }

  /**
   * Parses a query string into an AST
   * @param queryText The query text to parse
   * @returns The AST representation of the query
   */
  private parseQuery(queryText: string): ProgramNode {
    // Tokenize the query
    const tokenizer = new Tokenizer(queryText);
    const tokens = tokenizer.tokenize();

    // Parse the tokens into an AST
    const parser = new Parser(tokens);
    return parser.parse();
  }
}

// Export a singleton instance
const ssoql = new SSOQL();
export default ssoql;
