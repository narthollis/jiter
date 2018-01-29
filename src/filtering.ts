/**
 * Contains Iterable wrapping functions for skip behavior
 */
import { IndexProjection } from 'src/types';

export function *filter<T>(source: Iterable<T>, predicate: IndexProjection<T, boolean>): Iterable<T> {
    let i = -1;
    for (const item of source) {
        i += 1;
        if (predicate(item, i)) {
            yield item;
        }
    }
}

export function *skip<T>(source: Iterable<T>, count: number): Iterable<T> {
    const iterator = source[Symbol.iterator]();

    for (let i = 0; i < count; i += 1) {
        if (iterator.next().done) {
            return;
        }
    }

    let item: IteratorResult<T> = iterator.next();
    while (!item.done) {
        yield item.value;
        item = iterator.next();
    }
}

export function *skipWhile<T>(source: Iterable<T>, whileFn: IndexProjection<T, boolean>): Iterable<T> {
    let skipping = true;
    let i = -1;
    for (const item of source) {
        i += 1;
        if (skipping && whileFn(item, i)) {
            continue;
        } else {
            skipping = false;
            yield item;
        }
    }
}
