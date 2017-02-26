import {JIter} from '../src/JIter';

describe('JIter', () => {
    describe('create', () => {
        it('should not modify its source iterable', () => {
            const source = [Math.random(), Math.random(), Math.random()];
            const iter = JIter.create(source);

            expect(Array.from(iter)).toEqual(source);
        });
    });

    describe('filter', () => {
        it('should not execute immediately', () => {
            const source = [0, 1, 2];
            const fn = jest.fn();
            JIter.create(source).filter(fn);

            expect(fn).toHaveBeenCalledTimes(0);
        });

        it('should correctly filter items', () => {
            const source = [0, 1, 2];
            const fn = (n: number) => n % 2 === 0;
            const iter = JIter.create(source).filter(fn);

            expect(Array.from(iter)).toEqual(source.filter(fn));
        });
    });
});
