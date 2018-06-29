import {MemoizationLookup} from './MemoizationLookup';

describe('MemoizationLookup', () => {
    it('should return the value returned by the addSelector.', () => {
        const sut = new MemoizationLookup();
        const result = sut.getOrAdd([], [], () => 5);
        expect(result).toEqual(5);
    });
});