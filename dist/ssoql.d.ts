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
 * Creates a SSOQL query from a query string.
 * @param query - The SSOQL query string
 * @returns A SSOQLQuery object
 */
export declare function createQuery(query: string): SSOQLQuery;
/**
 * Main SSOQL module exports.
 */
declare const _default: {
    createQuery: typeof createQuery;
};
export default _default;
