import {MemoizationLookup} from './MemoizationLookup';
import { EqualityComparer } from './EqualityComparer';

describe('MemoizationLookup', () => {
    it('should return the value returned by the addSelector', () => {
        const sut = new MemoizationLookup([], () => 5);
        const result = sut.getOrAdd([]);
        expect(result).toEqual(5);
    });

    it('should pass the keys to the addSelector, if needed to be run', () => {
        let passedKeys;
        const sut = new MemoizationLookup([], args => passedKeys = args);
        sut.getOrAdd([1, 2]);
        expect(passedKeys).toEqual([1, 2]);
    });

    it('should store previously added values and not call addSelector again.', () => {
        let counter = 0;
        const sut = new MemoizationLookup([], () => counter++);

        sut.getOrAdd([1, 2]);
        sut.getOrAdd([1, 2]);

        expect(counter).toEqual(1);
    });

    it('should respect the order of keys when storing values', () => {
        let counter = 0;
        const sut = new MemoizationLookup([], () => counter++);
        
        sut.getOrAdd([1, 2]);
        sut.getOrAdd([2, 1]);

        expect(counter).toEqual(2);
    });

    it('should respect EqualityComparers if provided', () => {
        // Comparer that sees all even values as equal as well as all odd values.
        const equalityComparer: EqualityComparer = {
            equals: (a,b) => a % 2 === b % 2,
            getHashCode: x => x % 2
        };

        // Comparer should only be used for second key.
        let counter = 0;
        const sut = new MemoizationLookup([null, equalityComparer], () => counter++);

        sut.getOrAdd([1, 2]);
        sut.getOrAdd([1, 4]); // Memoized (second = even)
        sut.getOrAdd([1, 6]); // Memoized (second = even)
        sut.getOrAdd([3, 6]); // NOT memoized, first key is compared with default EqualityComparer.

        expect(counter).toEqual(2);
    });
});