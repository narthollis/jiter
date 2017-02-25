type OperationName = 'filter' | 'map' | 'reduce';

type OperationTuple = [OperationName, any[]];

interface LinkedOperation {
    name: OperationName;
    previous?: LinkedOperation;
    args: any[];
}

export class Jiter<TInput, TOutput> {
    private lastOperation?: LinkedOperation;
    private iterable: Iterable<TInput>;

    public static create<T>(iterable: Iterable<T>): Jiter<T,T> {
        return new Jiter<T, T>(iterable);
    }

    private constructor(iterable: Iterable<TInput>, lastOperation?: LinkedOperation) {
        this.iterable = iterable;
        this.lastOperation = lastOperation;
    }

    public filter(predicate: (item: TOutput) => boolean): Jiter<TInput, TOutput> {
        return new Jiter<TInput, TOutput>(this.iterable, { name: 'filter', previous: this.lastOperation, args: [predicate] });
    }

    public map<TResult>(mapFn: (item: TOutput) => TResult): Jiter<TInput, TResult> {
        return new Jiter<TInput, TResult>(this.iterable, { name: 'map', previous: this.lastOperation, args: [mapFn] });
    }

    public reduce<TResult>(reduceFn: (prev: TResult, item: TOutput) => TResult, initial: TResult): TResult {
        // return new Jiter<TInput, TResult>(this.iterable, { name: 'reduce', previous: this.lastOperation, args: [reduceFn, initial] });
    }

    private getOperations(): OperationTuple[] {
        const operations: OperationTuple[] = [];

        let op = this.lastOperation;
        while (op !== undefined) {
            operations.unshift([op.name, op.args]);
            op = op.previous;
        }

        return operations;
    }

    public [Symbol.iterator]() {
        const operations = this.getOperations();

    }

    public values() {
        return this[Symbol.iterator];
    }
}
