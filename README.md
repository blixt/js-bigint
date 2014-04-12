BigInt [![Build Status Image][]][Build Status]
======

Enables working with integers beyond 53 bits (the upper limit of what
JavaScript's `Number` type can accurately represent).

This is a pure JavaScript library, unlike other libraries that do the
same thing.


This project is in an early state
---------------------------------

Some basic operations are still missing. Most notably:

- Division (and modulus), but you can use bit shifting for powers of 2
- Comparison (greater than / less than)
- Square root

Feel free to submit a pull request for any of the above.


Example
-------

```js
var bigint = require('bigintjs');

console.log(bigint('99999999999999999999999999999').add('1').toString());
// 100000000000000000000000000000

// Bitwise operations on a big number (JavaScript only supports up to 32 bits)
var value = bigint('0xFFFFFFFFFFFFFFFF').and('0xF0F0F0F0F0F0F0F0').shiftLeft(8);
```


Using this package
------------------

You can install this package with [NPM][]:

```bash
npm install --save bigintjs
```

To be able to run this in a browser, you need to use a framework that
supports CommonJS modules (for example: [Browserify][]).


[Browserify]: http://browserify.org/
[Build Status]: https://travis-ci.org/blixt/js-bigint
[Build Status Image]: https://api.travis-ci.org/blixt/js-bigint.png?branch=master
[NPM]: https://www.npmjs.org/
