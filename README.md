# memoizer-ts
Allows adding memoization to arbitrary functions. The original function will only be called once for identical sets of arguments, subsequent calls will be returned with memoized results.

For more complex signatures, this Memoizer allows to define custom Equality-Comparers for comparing parameters.
