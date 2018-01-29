import {JIter} from 'src/JIter';

/**
 * Test JIter filters
 */

describe('JIter.filter', () => {
    it('should not execute immediately', () => {
        const source = [0, 1, 2];
        const fn = jest.fn();
        JIter.CREATE(source).filter(fn);

        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('should only return items for which the callback returns true', () => {
        const source = [0, 1, 2];
        const fn = (n: number) => n % 2 === 0;
        const iter = JIter.CREATE(source).filter(fn);

        expect(Array.from(iter)).toEqual(source.filter(fn));
    });

    it('should execute the callback exactly once per item in the source', () => {
        const source = [0, 1, 2];
        const fn = jest.fn((n: number) => n % 2 === 0);
        Array.from(JIter.CREATE(source).filter(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });

    it('should execute the callback in source order', () => {
        const source = [0, 1, 2];

        const results: [number, number][] = [];
        const fn = jest.fn((n: number, i: number) => results.push([i, n]));
        Array.from(JIter.CREATE(source).filter(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);

        for (const [i, n] of results) {
            expect(i).toBe(n);
        }
    });
});
