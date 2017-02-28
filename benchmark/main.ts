import * as Benchmark from 'benchmark';

import { JIter } from '../src/JIter';
import * as suiteFactories from './suites';

const lengths = [10, 100, 1000, 10000, 100000];
const runs = JIter.create(lengths)
    .flatMap(len => Object.keys(suiteFactories).map(key => ({ len, suite: <Benchmark.Suite>suiteFactories[key](len)})));
for (const {len, suite} of runs) {
    suite.on('start', () => console.log(`${len} items:`));
    suite.on('cycle', event => {
        console.log(String(event.target));
    }).on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    });
    suite.run({async: true});
}
