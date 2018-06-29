import { MemoizationLookup } from "./MemoizationLookup";
import { EqualityComparer } from "./EqualityComparer";

/**
 * Adds memoization to arbitrary functions.
 */
export module Memoizer {
    /**
    * Adds memoization to the specified function.
     * @param fn Function that should make use of memoization.
     * @param equalityComparers 
     * Optional equality comparers to define equality of parameters. 
     * Provided in the same order as the parameters, individual positions can be skipped by providing null.
     * @returns A function with the same signature and behaviour as the original function, but making use of memoization.
     */
    export function makeMemoized<T extends Function>(fn: T, ...equalityComparers : EqualityComparer[]): T {
        const lookup = new MemoizationLookup(equalityComparers || [], params => fn.apply(undefined, params));
        const memoized: any = function() {
            return lookup.getOrAdd(Array.prototype.slice.call(arguments, []));
        };

        return <T>memoized;
    }
}