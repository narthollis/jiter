import * as Benchmark from 'benchmark';
import { filter as _filter } from 'lodash';
import { JIter } from '../../src/JIter';

export function filter(arraySize: number): Benchmark.Suite {
    const suite = new Benchmark.Suite('filter');
    const array = new Array<number>(arraySize);
    for (let i = 0 ; i < arraySize ; i += 1) {
        array[i] = Math.random();
    }

    function *generator() {
        for (let i = 0 ; i < arraySize ; i += 1) {
            yield Math.random();
        }
    }

    suite.add('Array.prototype.filter', () => {
        for (const _ of array.filter(n => n < 0.5)) {}
    });

    suite.add('lodash filter', () => {
        for (const _ of _filter(array, n => n < 0.5)) {}
    });

    suite.add('JIter.filter', () => {
        for (const _ of JIter.create(array).filter(n => n < 0.5)) {}
    });

    suite.add('Array.prototype.filter generator', () => {
        for (const _ of [...generator()].filter(n => n < 0.5)) {}
    });

    suite.add('lodash filter generator', () => {
        for (const _ of _filter([...generator()], n => n < 0.5)) {}
    });

    suite.add('JIter.filter generator', () => {
        for (const _ of JIter.create(generator()).filter(n => n < 0.5)) {}
    });

    return suite;
}
