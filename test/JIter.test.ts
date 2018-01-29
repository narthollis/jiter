import {JIter} from 'src/JIter';

/**
 * Tests high level JIter functionality
 */

describe('create', () => {
    it('should not modify its source iterable', () => {
        const source = [0, 1, 2];
        const iter = JIter.CREATE(source);

        expect(Array.from(iter)).toEqual(source);
    });
});
