import { Memoizer } from "./Memoizer";

describe('Memoizer', () => {
    it('should give the same results as the original function', () => {
        const sut = Memoizer.makeMemoized(() => 3);
        expect(sut()).toEqual(3);
    });
})