import { Memoizer } from "./Memoizer";

describe('Memoizer', () => {
    it('should give the same results as the original function.', () => {
        const sut = Memoizer.makeMemoized(x => x+3);
        expect(sut(1)).toEqual(4);
        expect(sut(3)).toEqual(6);
    });

    it('should work with arbitrary function signatures.', () => {
        const sut = Memoizer.makeMemoized((a: string, b: number, c: Date) => ['string1', 'string2']);
        expect(sut("abc", 123, new Date())).toEqual(['string1', 'string2']);
    });

    it('should execute a parameterless function only once.', () => {
        const fn = jest.fn(() => 5);
        const sut = Memoizer.makeMemoized(fn);

        sut();
        sut();
        sut();

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should only execute the function once for an equal parameter', () => {
        const fn = jest.fn((x: number) => 5);
        const sut = Memoizer.makeMemoized(fn);

        // Call with two variations of the parameter.
        sut(1);
        sut(1);
        sut(2);
        sut(2);

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should only execute the function once for a set of equal parameters.', () => {
        const fn = jest.fn((a, b) => a - b);
        const sut = Memoizer.makeMemoized(fn);

        sut(5, 3);
        sut(2, 1);
        sut(5, 3);
        sut(2, 1);

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should make use of memoization within recursive functions', () => {
        let counter = 0;
        const sut = Memoizer.makeMemoized(n => {
            counter++;
            return n == 0 ? 1 : sut(n-1);
        });

        // This should make the mock function be called 51 times by recursion.
        sut(50);

        // This should make the mock funtion only be called one more time,
        // as the result for sut(50) is already memoized.
        sut(51);

        expect(counter).toEqual(52);
    });

    it('should improve speed for calculating the n-th fibonacci number (unrealistic sample use case though)', () => {
        const withoutMemoization = n => n === 1 || n === 2 ? 1 : withoutMemoization(n-1) + withoutMemoization(n-2);
        const withMemoization = Memoizer.makeMemoized(n => n === 1 || n === 2 ? 1 : withMemoization(n-1) + withMemoization(n-2));

        // Yes, this is the worst way to benchmark that you have ever seen.
        // It should just serve as a very rough way to tell us if the Memoizer can be useful at all.
        const startWithoutMemoization = new Date();
        const resultWithoutMemoization = withoutMemoization(30);
        const endWithoutMemoization = new Date();
        const durationWithoutMemoization = +endWithoutMemoization - +startWithoutMemoization;

        const startWithMemoization = new Date();
        const resultWithMemoization = withMemoization(30);
        const endWithMemoization = new Date();
        const durationWithMemoization = +endWithMemoization - +startWithMemoization;

        expect(resultWithoutMemoization).toEqual(resultWithMemoization);
        expect(durationWithMemoization).toBeLessThan(durationWithoutMemoization);
    });

    it('should respect EqualityComparers if provided', () => {
        const fn = jest.fn((a, b) => a * (b % 2 === 0 ? -1 : 1));

        // We know that the underlying function will behave the same for
        // all even values and all odd values. So we provide such an EqualityComparer:
        const sut = Memoizer.makeMemoized(fn, null, {
            getHashCode: (x) => x % 2,
            equals: (a, b) => a % 2 === b % 2
        })

        sut(3, 2);
        sut(3, 4); // Should be memoized.
        sut(3, 3);
        sut(2, 2);
        sut(2, 256) // Should be memoized.

        expect(fn).toHaveBeenCalledTimes(3);
    });
})