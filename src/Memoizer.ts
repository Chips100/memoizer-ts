import { MemoizationLookup } from "./MemoizationLookup";
import { EqualityComparer } from "./EqualityComparer";

/**
 * Adds memoization to arbitrary functions.
 */
export module Memoizer {
    /**
    * Adds memoization to the specified function.
     * @param fn Function that should make use of memoization.
     * @returns A function with the same signature and behaviour as the original function, but making use of memoization.
     */
    export function makeMemoized<T extends Function>(fn: T, ...equalityComparers : EqualityComparer[]): T {
        const lookup = new MemoizationLookup();
        const memoized: any = function() {
            // Extract parameters passed to the function.
            // We do not know about the exact signature here.
            var args = Array.prototype.slice.call(arguments, []);

            // Return value from memoized storage; does calculation if not yet memoized.
            return lookup.getOrAdd(args, equalityComparers, params => fn.apply(undefined, params));
        };

        return <T>memoized;
    }
}