/**
 * Contains Iterable wrapping functions for map behavior
 */
import { IndexProjection } from 'src/types';

export function *map<TInput, TOutput>(source: Iterable<TInput>, mapFn: IndexProjection<TInput, TOutput>): Iterable<TOutput> {
    let i = -1;
    for (const item of source) {
        i += 1;
        yield mapFn(item, i);
    }
}

export function *flatMap<T, TResult>(source: Iterable<T>, projection: IndexProjection<T, Iterable<TResult>>): Iterable<TResult> {
    let i = -1;
    for (const item of source) {
        i += 1;
        yield *projection(item, i);
    }
}
