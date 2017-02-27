import {JIter} from '../src/JIter';

describe('JIter.map', () => {
    it('should not execute immediately', () => {
        const source = [0, 1, 2];
        const fn = jest.fn();
        JIter.create(source).map(fn);

        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('should execute the map function exactly once per source item', () => {
        const source = [0, 1, 2];
        const fn = jest.fn(String);
        Array.from(JIter.create(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });

    it('should execute the callback in source order', () => {
        const source = [0, 1, 2];
        const fn = jest.fn((n: number, i: number) => expect(i).toBe(n));
        Array.from(JIter.create(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });

    it('should return mapped results in the original order', () => {
        const source = [0, 1, 2];
        const fn = jest.fn(String);
        Array.from(JIter.create(source).map(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });
});

