BigInt
======

Enables working with integers beyond 53 bits (the upper limit of what
JavaScript's `Number` type can accurately represent).

This is a pure JavaScript library, unlike other libraries that do the
same thing.

***Note:*** This is still a very early version and a lot of operations
are missing.


Example
-------

Here's how to create a `BigInt` from a series of binary values:

```js
var BigInt = require('bigintjs');

// Treat each value in the input array as a 32-bit integer.
var big = new BigInt([0xFF000000, 0x00000000, 0x00000000], 32);
console.log(big.toString());

// You can now perform arithmetics on the BigInt.
big.shiftRight(8);
console.log(big.toString());
```

In the future, it'll be possible to create a `BigInt` from a string.


Using this package
------------------

You can install this package with [NPM][]:

```bash
npm install --save bigintjs
```

To be able to run this in a browser, you need to use a framework that
supports CommonJS modules (for example: [Browserify][]).


[Browserify]: http://browserify.org/
[NPM]: https://www.npmjs.org/
