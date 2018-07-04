# memoizer-ts
[![Build Status](https://travis-ci.com/Chips100/memoizer-ts.svg?branch=master)](https://travis-ci.com/Chips100/memoizer-ts)
[![npm version](https://badge.fury.io/js/memoizer-ts.svg)](https://badge.fury.io/js/memoizer-ts)


The Memoizer adds memoization to arbitrary functions. The original function will only be called once for identical sets of arguments, subsequent calls will be returned with memoized results.

For more complex signatures, this Memoizer allows to define custom Equality-Comparers for comparing parameters.

## Getting started
### Install the package
```
npm install memoizer-ts --save
```

### Use the Memoizer
The Memoizer can be used to add memoization to any function. It makes use of TypeScript's type system to return a strongly typed new function with the same signature as your original function.

```typescript
import {Memoizer} from 'memoizer-ts';

class MyClass {
  public calculate = Memoizer.makeMemoized(this.calculateImplementation);

  private calculateImplementation(n: number): number { ... }
}

```

### Recursive example
You can also define a recursive function that calls the memoized version of itself. This can be especially useful if the recursion leads to multiple calls to the function with the same set of parameters. This example calculates the n-th Fibonacci number, making use of memoization and thus avoiding repetitive calculations for the same n.

```typescript
const nthFibonacci = Memoizer.makeMemoized(n =>
  n === 0 || n === 1 ? n :
  nthFibonacci(n-1) + nthFibonacci(n-2));
```

**Note**: This example results in rounding errors rather quickly, it is just for demonstration purposes to show how memoization can speed up a recursive function significantly (although of course there are other, faster ways for the Fibonacci-sequence).

### Equality Comparers
By default, parameters of memoized function calls will be compared by strict equality (`===`). You can provide custom equality comparers to the Memoizer, in the same order as the parameters that should be compared. You can skip individual equality comparers by passing `null`; in the following (totally made up) example we provide an equality comparer for the second parameter:

```typescript
// We know that the underlying function will behave the same for
// all even values and all odd values. So we provide such an EqualityComparer:
const memoized = Memoizer.makeMemoized(fn, null, {
    getHashCode: (x) => x % 2,
    equals: (a, b) => a % 2 === b % 2
});
```