import { Comparator, IndexProjection, Projection } from 'src/types';

import { filter, skip, skipWhile } from 'src/filtering';
import { groupBy, IGrouping } from 'src/grouping';
import { flatMap, map } from 'src/map';

function descending<T>(comparator: Comparator<T>): Comparator<T> {
    return (a, b) => comparator(b, a);
}

export function *join<TInner, TOuter, TKey, TResult>(
    inner: Iterable<TInner>,
    outer: Iterable<TOuter>,
    innerKeyFn: (item: TInner) => TKey,
    outerKeyFn: (item: TOuter) => TKey,
    joinFn: (inner: TInner, outer: TOuter) => TResult
): Iterable<TResult> {
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of outer) {
        const key = outerKeyFn(item);
        let array = outerMap.get(key);
        if (array === undefined) {
            array = [];
            outerMap.set(key, array);
        }
        array.push(item);
        outerMap.set(key, array);
    }

    for (const item of inner) {
        const key = innerKeyFn(item);
        const outerArray = outerMap.get(key);
        if (outerArray === undefined) {
            continue;
        }

        for (const outerItem of outerArray) {
            yield joinFn(item, outerItem);
        }
    }
}

export function *groupJoin<TInner, TOuter, TKey, TResult>(
    inner: Iterable<TInner>,
    outer: Iterable<TOuter>,
    innerKeyFn: (item: TInner) => TKey,
    outerKeyFn: (item: TOuter) => TKey,
    joinFn: (inner: TInner, outer: Iterable<TOuter>) => TResult
): Iterable<TResult> {
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of outer) {
        const key = outerKeyFn(item);
        let array = outerMap.get(key);
        if (array === undefined) {
            array = [];
            outerMap.set(key, array);
        }
        array.push(item);
        outerMap.set(key, array);
    }

    for (const item of inner) {
        const key = innerKeyFn(item);
        const outerArray = outerMap.get(key);
        yield joinFn(item, (outerArray != null ? outerArray : []));
    }
}

export function *distinct<T>(source: Iterable<T>) {
    const $set = new Set<T>();
    for (const item of source) {
        if ($set.has(item)) {
            continue;
        }
        $set.add(item);
        yield item;
    }
}

export function *take<T>(source: Iterable<T>, count: number): Iterable<T> {
    const iterator = source[Symbol.iterator]();
    for (let i = 0; i < count; i += 1) {
        const item = iterator.next();
        if (item.done) {
            return;
        }
        yield item.value;
    }
}

export function *takeWhile<T>(source: Iterable<T>, whileFn: IndexProjection<T, boolean>): Iterable<T> {
    let i = -1;
    for (const item of source) {
        i += 1;
        if (whileFn(item, i)) {
            yield item;
        } else {
            return;
        }
    }
}

export function *reverse<T>(source: Iterable<T>): Iterable<T> {
    const buffer = Array.from(source);
    while (buffer.length > 0) {
        // tslint:disable-next-line:no-non-null-assertion Guarded by while condition
        yield buffer.pop()!;
    }
}

/**
 * JIter wraps an iterable for perfoming just-in-time collection manipluations
 * @template Iterable<T>
 */
export class JIter<T> implements Iterable<T> {
    protected source: Iterable<T>;

    protected constructor(source: Iterable<T>) {
        this.source = source;
    }

    public static CREATE<T>(iterable: Iterable<T>): JIter<T> {
        return new JIter<T>(iterable);
    }

    public filter(predicate: IndexProjection<T, boolean>): JIter<T> {
        return new JIter(filter(this.source, predicate));
    }

    public map<TResult>(mapFn: IndexProjection<T, TResult>): JIter<TResult> {
        return new JIter(map(this.source, mapFn));
    }

    public flatMap<TResult>(mapFn: IndexProjection<T, Iterable<TResult>>): JIter<TResult> {
        return new JIter(flatMap(this.source, mapFn));
    }

    public reduce<TResult>(reduceFn: (prev: TResult, current: T, index: number) => TResult, initial: TResult): TResult {
        let reduction = initial;
        let i = -1;
        for (const item of this.source) {
            i += 1;
            reduction = reduceFn(reduction, item, i);
        }

        return reduction;
    }

    public distinct(): JIter<T> {
        return new JIter(distinct(this.source));
    }

    public skip(count: number): JIter<T> {
        return new JIter(skip(this.source, count));
    }

    public skipWhile(whileFn: IndexProjection<T, boolean>): JIter<T> {
        return new JIter(skipWhile(this.source, whileFn));
    }

    public take(count: number): JIter<T> {
        return new JIter(take(this.source, count));
    }

    public takeWhile(whileFn: IndexProjection<T, boolean>): JIter<T> {
        return new JIter(takeWhile(this.source, whileFn));
    }

    public orderBy(compareFn: Comparator<T>): JOrderingIter<T> {
        // tslint:disable-next-line:no-use-before-declare Chicken and Egg
        return new JOrderingIter(this, [compareFn]);
    }

    public orderByDescending(compareFn: Comparator<T>): JOrderingIter<T> {
        // tslint:disable-next-line:no-use-before-declare Chicken and Egg
        return new JOrderingIter(this, [descending(compareFn)]);
    }

    public groupBy<TKey>(keyFn: Projection<T, TKey>): JIter<IGrouping<TKey, T>> {
        return new JIter(groupBy(this.source, keyFn));
    }

    public reverse(): JIter<T> {
        return new JIter(reverse(this.source));
    }

    public join<TOuter, TKey, TResult>(
        outer: Iterable<TOuter>,
        innerKeyFn: (item: T) => TKey,
        outerKeyFn: (item: TOuter) => TKey,
        joinFn: (inner: T, outer: TOuter) => TResult
    ): JIter<TResult> {
        return new JIter(join(this.source, outer, innerKeyFn, outerKeyFn, joinFn));
    }

    public groupJoin<TOuter, TKey, TResult>(
        outer: Iterable<TOuter>,
        innerKeyFn: (item: T) => TKey,
        outerKeyFn: (item: TOuter) => TKey,
        joinFn: (inner: T, outer: Iterable<TOuter>) => TResult
    ): JIter<TResult> {
        return new JIter(groupJoin(this.source, outer, innerKeyFn, outerKeyFn, joinFn));
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public [Symbol.iterator](): Iterator<T> {
        return this.source[Symbol.iterator]();
    }
}

/**
 * Orderable JIter
 *
 * @template T Iterable Type
 */
class JOrderingIter<T> extends JIter<T> {
    private comparators: Comparator<T>[];

    constructor(source: Iterable<T>, comparators: Comparator<T>[]) {
        super(source);
        this.comparators = comparators;
    }

    public thenBy(comparator: Comparator<T>): JOrderingIter<T> {
        return new JOrderingIter(this.source, [...this.comparators, comparator]);
    }

    public thenByDescending(comparator: Comparator<T>): JOrderingIter<T> {
        return new JOrderingIter(this.source, [...this.comparators, descending(comparator)]);
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public *[Symbol.iterator](): Iterator<T> {
        const list = Array.from(this.source);
        list.sort((a, b) => {
            let result = 0;
            for (const comparator of this.comparators) {
                result = comparator(a, b);
                if (result !== 0) {
                    break;
                }
            }

            return result;
        });

        yield *list;
    }
}
