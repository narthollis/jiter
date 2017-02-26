type Projection<T, TProjection> = (item: T) => TProjection;

export class JIter<T> implements Iterable<T> {
    protected source: Iterable<T>;

    public static create<T>(iterable: Iterable<T>): JIter<T> {
        return new JIter<T>(iterable);
    }

    protected constructor(source: Iterable<T>) {
        this.source = source;
    }

    public filter(predicate: Projection<T, boolean>): JIter<T> {
        return new JIter(filter(this.source, predicate));
    }

    public map<TResult>(mapFn: Projection<T, TResult>): JIter<TResult> {
        return new JIter(map(this.source, mapFn));
    }

    public flatMap<TResult>(mapFn: Projection<T, Iterable<TResult>>) {
        return new JIter(flatMap(this.source, mapFn));
    }

    public reduce<TResult>(reduceFn: (prev: TResult, current: T) => TResult, initial: TResult): TResult {
        let reduction = initial;
        for (const item of this.source) {
            reduction = reduceFn(reduction, item);
        }
        return reduction;
    }

    public distinct(): JIter<T> {
        return new JIter(distinct(this.source));
    }

    public skip(count: number): JIter<T> {
        return new JIter(skip(this.source, count));
    }

    public skipWhile(whileFn: Projection<T, boolean>): JIter<T> {
        return new JIter(skipWhile(this.source, whileFn));
    }

    public take(count: number): JIter<T> {
        return new JIter(take(this.source, count));
    }

    public takeWhile(whileFn: Projection<T, boolean>): JIter<T> {
        return new JIter(takeWhile(this.source, whileFn));
    }

    public orderBy(compareFn: Comparator<T>): JOrderingIter<T> {
        return new JOrderingIter(this, [compareFn]);
    }

    public orderByDescending(compareFn: Comparator<T>): JOrderingIter<T> {
        return new JOrderingIter(this, [descending(compareFn)]);
    }

    public groupBy<TKey>(keyFn: Projection<T, TKey>): JIter<IGrouping<TKey, T>> {
        return new JIter(groupBy(this.source, keyFn));
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
    public [Symbol.iterator]() {
        return this.source[Symbol.iterator]();
    }
}

type Comparator<T> = (a: T, b: T) => number;

class JOrderingIter<T> extends JIter<T> {
    private comparators: Comparator<T>[];

    constructor(source: Iterable<T>, comparators: Comparator<T>[]) {
        super(source);
        this.comparators = comparators;
    }

    public thenBy(comparator: Comparator<T>) {
        return new JOrderingIter(this.source, [...this.comparators, comparator]);
    }

    public thenByDescending(comparator: Comparator<T>) {
        return new JOrderingIter(this.source, [...this.comparators, descending(comparator)]);
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public *[Symbol.iterator]() {
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

function descending<T>(comparator: Comparator<T>): Comparator<T> {
    return (a, b) => comparator(b, a);
}

interface IGrouping<TKey, T> extends Iterable<T> {
    key: TKey;
}

class Grouping<TKey, T> implements IGrouping<TKey, T> {
    public key: TKey;
    private items: T[];

    public constructor(key: TKey, items: T[]) {
        this.key = key;
        this.items = items;
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
}

export function *groupBy<T, TKey>(source: Iterable<T>, keyFn: (item: T) => TKey): Iterable<IGrouping<TKey, T>> {
    const map = new Map<TKey, T[]>();
    for (const item of source) {
        const key = keyFn(item);
        let group = map.get(key);
        if (group === undefined) {
            group = [];
            map.set(key, group);
        }
    }
    for (const [key, values] of map) {
        yield new Grouping(key, values);
    }
}

export function *filter<T>(source: Iterable<T>, predicate: (item: T) => boolean): Iterable<T> {
    for (const item of source) {
        if (predicate(item)) {
            yield item;
        }
    }
}

export function *map<TInput, TOutput>(source: Iterable<TInput>, mapFn: (item: TInput) => TOutput): Iterable<TOutput> {
    for (const item of source) {
        yield mapFn(item);
    }
}

export function *flatMap<T, TResult>(source: Iterable<T>, projection: Projection<T, Iterable<TResult>>): Iterable<TResult> {
    for (const item of source) {
        yield *projection(item);
    }
}

export function *join<TInner, TOuter, TKey, TResult>(
    inner: Iterable<TInner>,
    outer: Iterable<TOuter>,
    innerKeyFn: (item: TInner) => TKey,
    outerKeyFn: (item: TOuter) => TKey,
    joinFn: (inner: TInner, outer: TOuter) => TResult
): Iterable<TResult> {
    const innerMap = new Map<TKey, TInner[]>();
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of inner) {
        const key = innerKeyFn(item);
        let array = innerMap.get(key);
        if (array === undefined) {
            array = [];
            innerMap.set(key, array);
        }
        array.push(item);
        innerMap.set(key, array);
    }
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

    for (const [key, innerArray] of innerMap) {
        const outerArray = outerMap.get(key);
        if (outerArray === undefined) {
            continue;
        }
        for (const innerItem of innerArray) {
            for (const outerItem of outerArray) {
                yield joinFn(innerItem, outerItem);
            }
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
    const innerMap = new Map<TKey, TInner[]>();
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of inner) {
        const key = innerKeyFn(item);
        let array = innerMap.get(key);
        if (array === undefined) {
            array = [];
            innerMap.set(key, array);
        }
        array.push(item);
        innerMap.set(key, array);
    }
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

    for (const [key, innerArray] of innerMap) {
        const outerArray = outerMap.get(key) || [];
        for (const innerItem of innerArray) {
            yield joinFn(innerItem, outerArray);
        }
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

export function *takeWhile<T>(source: Iterable<T>, whileFn: (item: T) => boolean): Iterable<T> {
    for (const item of source) {
        if (whileFn(item)) {
            yield item;
        } else {
            return;
        }
    }
}

export function *skip<T>(source: Iterable<T>, count: number): Iterable<T> {
    const iterator = source[Symbol.iterator]();
    for (let i = 0; i < count; i += 1) {
        const item = iterator.next();
        if (item.done) {
            return;
        }
    }
    let item = iterator.next();
    while (!item.done) {
        yield item.value;
        item = iterator.next();
    }
}

export function *skipWhile<T>(source: Iterable<T>, whileFn: (item: T) => boolean): Iterable<T> {
    let skipping = true;
    for (const item of source) {
        if (skipping && whileFn(item)) {
            continue;
        } else {
            skipping = false;
            yield item;
        }
    }
}
