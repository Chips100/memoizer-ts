# memoizer-ts
[![Build Status](https://travis-ci.com/Chips100/memoizer-ts.svg?branch=master)](https://travis-ci.com/Chips100/memoizer-ts)
[![npm version](https://badge.fury.io/js/memoizer-ts.svg)](https://badge.fury.io/js/memoizer-ts)


Allows adding memoization to arbitrary functions. The original function will only be called once for identical sets of arguments, subsequent calls will be returned with memoized results.

For more complex signatures, this Memoizer allows to define custom Equality-Comparers for comparing parameters.
