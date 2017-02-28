import * as Benchmark from 'benchmark';
import { map as _map } from 'lodash';
import { JIter } from '../../src/JIter';

export function map(arraySize: number): Benchmark.Suite {
    const suite = new Benchmark.Suite('map');
    const array = new Array<number>(arraySize);
    for (let i = 0 ; i < arraySize ; i += 1) {
        array[i] = Math.random();
    }

    suite.add('Array.prototype.map', () => {
        for (const _ of array.map(String)) {}
    });

    suite.add('lodash map', () => {
        for (const _ of _map(array, String)) {}
    });

    suite.add('JIter.map', () => {
        for (const _ of JIter.create(array).map(String)) {}
    });

    return suite;
}
