/**
 * SSOQL - Super Simple Object Query Language
 * A simple language for querying JavaScript objects with schema support.
 *
 * This implementation follows the specification outlined in the README.md file.
 * SSOQL allows for querying nested JavaScript objects using a SQL-like syntax
 * with support for USE statements, multiple named queries, and various operations
 * like SELECT, COUNT, SUM, DIVIDE, PERCENT_OF, and MOST_FREQUENT.
 */
import { SSOQLQuery } from "./types/types";
/**
 * SSOQL implementation class
 * Handles query creation and execution
 */
declare class SSOQL {
    /**
     * Creates a new SSOQL query from a query string
     * @param queryText The SSOQL query text
     * @returns A SSOQLQuery object that can be executed against data
     */
    createQuery(queryText: string): SSOQLQuery;
    /**
     * Parses a query string into an AST
     * @param queryText The query text to parse
     * @returns The AST representation of the query
     */
    private parseQuery;
}
declare const ssoql: SSOQL;
export default ssoql;
