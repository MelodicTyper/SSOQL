"use strict";
/**
 * SSOQL - Super Simple Object Query Language
 * A simple language for querying JavaScript objects with schema support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuery = createQuery;
/**
 * Parser for SSOQL queries.
 */
class SSOQLParser {
    constructor(query) {
        this.usedObjects = [];
        this.query = query.trim();
        this.parseUseStatements();
    }
    /**
     * Parse USE statements to identify required objects.
     */
    parseUseStatements() {
        const useRegex = /USE\s+(\w+)/gi;
        let match;
        while ((match = useRegex.exec(this.query)) !== null) {
            this.usedObjects.push(match[1]);
        }
    }
    /**
     * Get the list of objects used in the query.
     */
    getUsedObjects() {
        return [...new Set(this.usedObjects)]; // Return unique objects
    }
    /**
     * Parse and execute the query against the provided data.
     */
    execute(data) {
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
function createQuery(query) {
    const parser = new SSOQLParser(query);
    return {
        expectedObjects() {
            return parser.getUsedObjects();
        },
        execute(data) {
            return parser.execute(data);
        }
    };
}
/**
 * Main SSOQL module exports.
 */
exports.default = {
    createQuery
};
