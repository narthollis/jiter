/**
 * Tests JIter maping functionality
 */

import {JIter} from 'src/JIter';

describe('JIter.map', () => {
    it('should not execute immediately', () => {
        const source = [0, 1, 2];
        const fn = jest.fn();
        JIter.CREATE(source).map(fn);

        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('should execute the map function exactly once per source item', () => {
        const source = [0, 1, 2];
        const fn = jest.fn(String);
        Array.from(JIter.CREATE(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });

    it('should execute the callback in source order', () => {
        const source = [0, 1, 2];

        const results: [number, number][] = [];
        const fn = jest.fn((n: number, i: number) => results.push([i, n]));
        Array.from(JIter.CREATE(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);

        for (const [i, n] of results) {
            expect(i).toBe(n);
        }
    });

    it('should return mapped results in the original order', () => {
        const source = [0, 1, 2];
        const fn = jest.fn(String);
        Array.from(JIter.CREATE(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });
});
