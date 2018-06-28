/**
 * Allows comparing two values for equality and producing hash codes.
 */
export interface EqualityComparer {
    /**
     * Gets the hash code for the specified value.
     * @param value Value to get the hash code for.
     * @returns The hash code. Will always be the same for equal values, and different for most unequal cases.
     */
    getHashCode(value: any): number;

    /**
     * Compares two values for equality.
     * @param a First value to compare.
     * @param b Second value to compare.
     */
    equals(a: any, b: any): boolean;
}