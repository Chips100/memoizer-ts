import { EqualityComparer } from "./EqualityComparer";

export class MemoizationLookup {
    private static readonly NoValue = {};
    
    private static readonly DefaultEqualityComparer: EqualityComparer = {
        getHashCode(input: any): number { return +input; },
        equals(a: any, b: any): boolean { return a === b; }
    };

    private readonly memoizationEntryCollection: MemoizationEntryCollection = {};
    
    private noKeysValue = MemoizationLookup.NoValue;;

    public getOrAdd(keys: any[], equalityComparers: EqualityComparer[], addSelector: (x: any[]) => any): any {
        // Handle case for no keys (zero-length).
        if (keys.length === 0) {
            // If noKeysValue has not been calculated before, do it now; otherwise just return it.
            return this.noKeysValue !== MemoizationLookup.NoValue ? this.noKeysValue : this.noKeysValue = addSelector(keys);
        }

        return this.getOrAddInternal(this.memoizationEntryCollection, keys, equalityComparers, addSelector, 0);
    }

    private getOrAddInternal(lookup: MemoizationEntryCollection, keys: any[], equalityComparers: EqualityComparer[], addSelector: (x: any[]) => any, index: number): any {
        const key = keys[index],
            equalityComparer = equalityComparers[index] || MemoizationLookup.DefaultEqualityComparer,
            hashcode = equalityComparer.getHashCode(key),
            entries = this.getOrAddForHashCode(lookup, hashcode),
            entry = this.getOrAddByKey(entries, key, equalityComparer);

        if (index + 1 < keys.length) {
           return this.getOrAddInternal(entry.nextKeys, keys, equalityComparers, addSelector, index + 1); 
        }

        if (entry.result === MemoizationLookup.NoValue) {
            entry.result = addSelector(keys);
        }

        return entry.result;
    }

    private getOrAddForHashCode(collection: MemoizationEntryCollection, hashcode: number): MemoizationEntry[] {
        let entries = collection[hashcode];
        if (!entries) {
            entries = [];
            collection[hashcode] = entries;
        }

        return entries;
    }

    private getOrAddByKey(entries: MemoizationEntry[], key: any, equalityComparer: EqualityComparer) {
        let entry = this.findEqualKey(entries, key, equalityComparer);
        if (!entry) {
            entry = {
                key: key,
                nextKeys: {},
                result: MemoizationLookup.NoValue
            }

            entries.push(entry);
        }

        return entry;
    }

    private findEqualKey(entries: MemoizationEntry[], key: any, equalityComparer: EqualityComparer): MemoizationEntry {
        for (let entry of entries) {
            if (equalityComparer.equals(key, entry.key)) {
                return entry;
            }
        }
    }
}

interface MemoizationEntry {
    key: any;
    nextKeys: MemoizationEntryCollection;
    result: any;
}

interface MemoizationEntryCollection {
    [hashcode: number]: MemoizationEntry[];
}