import {JIter} from '../src/JIter';

describe('JIter.filter', () => {
    it('should not execute immediately', () => {
        const source = [0, 1, 2];
        const fn = jest.fn();
        JIter.create(source).filter(fn);

        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('should only return items for which the callback returns true', () => {
        const source = [0, 1, 2];
        const fn = (n: number) => n % 2 === 0;
        const iter = JIter.create(source).filter(fn);

        expect(Array.from(iter)).toEqual(source.filter(fn));
    });

    it('should execute the callback exactly once per item in the source', () => {
        const source = [0, 1, 2];
        const fn = jest.fn((n: number) => n % 2 === 0);
        Array.from(JIter.create(source).filter(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });

    it('should execute the callback in source order', () => {
        const source = [0, 1, 2];
        const fn = jest.fn((n: number, i: number) => expect(i).toBe(n));
        Array.from(JIter.create(source).filter(fn));

        expect(fn).toHaveBeenCalledTimes(source.length);
    });
});
