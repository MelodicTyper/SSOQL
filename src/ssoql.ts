/**
 * SSOQL - Super Simple Object Query Language
 * A simple language for querying JavaScript objects with schema support.
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
   * @returns The query results
   */
  execute(data: Record<string, any>): any[];
}

/**
 * Parser for SSOQL queries.
 */
class SSOQLParser {
  private query: string;
  private usedObjects: string[] = [];

  constructor(query: string) {
    this.query = query.trim();
    this.parseUseStatements();
  }

  /**
   * Parse USE statements to identify required objects.
   */
  private parseUseStatements(): void {
    const useRegex = /USE\s+(\w+)/gi;
    let match;

    while ((match = useRegex.exec(this.query)) !== null) {
      this.usedObjects.push(match[1]);
    }
  }

  /**
   * Get the list of objects used in the query.
   */
  getUsedObjects(): string[] {
    return [...new Set(this.usedObjects)]; // Return unique objects
  }

  /**
   * Parse and execute the query against the provided data.
   */
  execute(data: Record<string, any>): any[] {
    // Check if all required objects are provided
    for (const obj of this.usedObjects) {
      if (!(obj in data)) {
        throw new Error(`Object '${obj}' referenced in query but not provided in data`);
      }
    }

    // This is a placeholder for actual query execution logic
    // In a real implementation, this would parse and execute the query
    // For now, we'll return an empty array
    return [];
  }
}

/**
 * Creates a SSOQL query from a query string.
 * @param query - The SSOQL query string
 * @returns A SSOQLQuery object
 */
export function createQuery(query: string): SSOQLQuery {
  const parser = new SSOQLParser(query);

  return {
    expectedObjects(): string[] {
      return parser.getUsedObjects();
    },

    execute(data: Record<string, any>): any[] {
      return parser.execute(data);
    }
  };
}

/**
 * Main SSOQL module exports.
 */
export default {
  createQuery
};
