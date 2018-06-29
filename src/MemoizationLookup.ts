import { EqualityComparer } from "./EqualityComparer";

/**
 * Storage to hold calculation results for memoization.
 */
export class MemoizationLookup {
    /**
     * Internal marker to signalize missing values (not yet calculated and memoized).
     */
    private static readonly NoValue = {};
    
    /**
     * Default Equality comparer - compares by strict equality and tries
     * to convert the value into a number for use as the hashcode.
     */
    private static readonly DefaultEqualityComparer: EqualityComparer = {
        getHashCode(input: any): number { return +input; },
        equals(a: any, b: any): boolean { return a === b; }
    };

    /**
     * Collection that holds the memoized results for this storage.
     */
    private readonly memoizationEntryCollection: MemoizationEntryCollection = {};

    /**
     * EqualityComparers that should be use for comparing keys (in the respective order of keys).
     */
    private readonly equalityComparers: EqualityComparer[];

    /**
     * Function to use for adding new values, if not memoized before.
     */
    private readonly addSelector: (key:any[]) => any;
    
    /**
     * Value that has been memoized for the special case of no keys (zero-length).
     */
    private noKeysValue = MemoizationLookup.NoValue;

    /**
     * Creates a new, empty MemoizationLookup.
     * @param equalityComparers EqualityComparers that should be use for comparing keys (in the respective order of keys).
     * @param addSelector Function to use for adding new values, if not memoized before.
     */
    public constructor(equalityComparers: EqualityComparer[], addSelector: (key:any[]) => any) {
        this.equalityComparers = equalityComparers;
        this.addSelector = addSelector;
    }

    /**
     * Gets the memoized value for the specified keys; or runs the calculation if not yet memoized.
     * @param keys Keys of the value to get.
     * @param addSelector Selector to run if the result has not yet been memoized.
     * @returns The memoized value; or the result of the calculation if not yet memoized.
     */
    public getOrAdd(keys: any[]): any {
        // Handle case for no keys (zero-length).
        if (keys.length === 0) {
            // If noKeysValue has not been calculated before, do it now; otherwise just return it.
            return this.noKeysValue !== MemoizationLookup.NoValue ? this.noKeysValue : this.noKeysValue = this.addSelector(keys);
        }

        return this.getOrAddInternal(this.memoizationEntryCollection, keys, 0);
    }

    /**
     * Gets the memoized value by walking the hierarchy of stored keys
     * recursively. For a single key, this means an ordinary dictionary lookup,
     * for each additional key a nested lookup.
     * Missing entries for keys are created on the fly.
     * @param lookup Lookup for the current key.
     * @param keys Complete array of keys that is looked up.
     * @param index Current index that is processed in the array of keys.
     * @returns The memoized value; calculated by addSelector if it has not been memoized before.
     */
    private getOrAddInternal(lookup: MemoizationEntryCollection, keys: any[], index: number): any {
        const key = keys[index],
            equalityComparer = this.equalityComparers[index] || MemoizationLookup.DefaultEqualityComparer,
            hashcode = equalityComparer.getHashCode(key),
            entries = this.getOrAddForHashCode(lookup, hashcode),
            entry = this.getOrAddByKey(entries, key, equalityComparer);

        // If more keys are present after the current key, search in the next hierarchy level.
        if (index + 1 < keys.length) {
           return this.getOrAddInternal(entry.nextKeys, keys, index + 1); 
        }

        // Otherwise this is the result we are interested in; calculate if not yet memoized.
        if (entry.result === MemoizationLookup.NoValue) {
            entry.result = this.addSelector(keys);
        }

        return entry.result;
    }

    /**
     * Gets the entries for the specified hashcode, 
     * or creates the collection on the fly if not yet present.
     * @param collection Collection with the entries for hash codes.
     * @param hashcode The current hashcode.
     * @returns The entries for the specified hashcode.
     */
    private getOrAddForHashCode(collection: MemoizationEntryCollection, hashcode: number): MemoizationEntry[] {
        let entries = collection[hashcode];
        if (!entries) {
            entries = [];
            collection[hashcode] = entries;
        }

        return entries;
    }

    /**
     * Looks for the entry for the specified key in the array of entries.
     * @param entries Entries that might contain the specified key.
     * @param key Key that should be looked for.
     * @param equalityComparer EqualityComparer to use for comparing keys.
     * @returns The entry for the specified key; will be created on the fly if necessary.
     */
    private getOrAddByKey(entries: MemoizationEntry[], key: any, equalityComparer: EqualityComparer) {
        for (let entry of entries) {
            if (equalityComparer.equals(key, entry.key)) {
                return entry;
            }
        }

        // Not found; create empty entry.
        const entry= {
            key: key,
            nextKeys: {},
            result: MemoizationLookup.NoValue
        };

        entries.push(entry);
        return entry;
    }
}

/**
 * Represents a single memoized entry for a key.
 */
interface MemoizationEntry {
    /**
     * The key for which a result has been memoized.
     */
    key: any;

    /**
     * Nested entries if more keys are specified after the current key.
     */
    nextKeys: MemoizationEntryCollection;

    /**
     * The memoized result; or MemoizationLookup.NoValue if not yet memoized.
     */
    result: any;
}

/**
 * Represents a collection of memoized entries,
 * stored in a dictionary-way under the hash code of the key of the entry.
 */
interface MemoizationEntryCollection {
    /**
     * Key = HashCode of the key in the entry
     * Value = The entry.
     */
    [hashcode: number]: MemoizationEntry[];
}