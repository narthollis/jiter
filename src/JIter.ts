export class JIter<T> implements Iterable<T> {
    protected source: Iterable<T>;

    public static create<T>(iterable: Iterable<T>): JIter<T> {
        return new JIter<T>(iterable);
    }

    protected constructor(source: Iterable<T>) {
        this.source = source;
    }

    public filter(predicate: (item: T) => boolean): JIter<T> {
        return new JIter(filter(this.source, predicate));
    }

    public map<TResult>(mapFn: (item: T) => TResult): JIter<TResult> {
        return new JIter(map(this.source, mapFn));
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

    public skipWhile(whileFn: (item: T) => boolean): JIter<T> {
        return new JIter(skipWhile(this.source, whileFn));
    }

    public take(count: number): JIter<T> {
        return new JIter(take(this.source, count));
    }

    public takeWhile(whileFn: (item: T) => boolean): JIter<T> {
        return new JIter(takeWhile(this.source, whileFn));
    }

    public orderBy(compareFn: CompareFn<T>): JOrderingIter<T> {
        return new JOrderingIter<T>(this.source, [compareFn]);
    }

    public join<TOuter, TKey, TResult>(
        outer: Iterable<TOuter>,
        innerKeyFn: (item: T) => TKey,
        outerKeyFn: (item: TOuter) => TKey,
        joinFn: (inner: T, outer: TOuter) => TResult
    ): JIter<TResult> {
        return new JIter(join(this.source, outer, innerKeyFn, outerKeyFn, joinFn));
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public [Symbol.iterator]() {
        return this.source[Symbol.iterator]();
    }
}

type CompareFn<T> = (a: T, b: T) => number;

class JOrderingIter<T> extends JIter<T> {
    private comparators: CompareFn<T>[];

    constructor(source: Iterable<T>, comparators: CompareFn<T>[]) {
        super(source);
        this.comparators = comparators;
    }

    public thenBy(comparator: CompareFn<T>) {
        return new JOrderingIter(this.source, [...this.comparators, comparator]);
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

function *filter<T>(source: Iterable<T>, predicate: (item: T) => boolean) {
    for (const item of source) {
        if (predicate(item)) {
            yield item;
        }
    }
}

function *map<TInput, TOutput>(source: Iterable<TInput>, mapFn: (item: TInput) => TOutput) {
    for (const item of source) {
        yield mapFn(item);
    }
}

function *join<TInner, TOuter, TKey, TResult>(
    inner: Iterable<TInner>,
    outer: Iterable<TOuter>,
    innerKeyFn: (item: TInner) => TKey,
    outerKeyFn: (item: TOuter) => TKey,
    joinFn: (inner: TInner, outer: TOuter) => TResult
) {
    const innerMap = new Map<TKey, TInner[]>();
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of inner) {
        const key = innerKeyFn(item);
        const array = innerMap.get(key) || [];
        array.push(item);
        innerMap.set(key, array);
    }
    for (const item of outer) {
        const key = outerKeyFn(item);
        const array = outerMap.get(key) || [];
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

function *distinct<T>(source: Iterable<T>) {
    const $set = new Set<T>();
    for (const item of source) {
        if ($set.has(item)) {
            continue;
        }
        $set.add(item);
        yield item;
    }
}

function *take<T>(source: Iterable<T>, count: number): Iterable<T> {
    const iterator = source[Symbol.iterator]();
    for (let i = 0; i < count; i += 1) {
        const item = iterator.next();
        if (item.done) {
            return;
        }
        yield item.value;
    }
}

function *takeWhile<T>(source: Iterable<T>, whileFn: (item: T) => boolean): Iterable<T> {
    for (const item of source) {
        if (whileFn(item)) {
            yield item;
        } else {
            return;
        }
    }
}

function *skip<T>(source: Iterable<T>, count: number): Iterable<T> {
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

function *skipWhile<T>(source: Iterable<T>, whileFn: (item: T) => boolean): Iterable<T> {
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
