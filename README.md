BigInt [![Build Status Image][]][Build Status]
======

Enables working with integers beyond 53 bits (the upper limit of what
JavaScript's `Number` type can accurately represent).

This is a pure JavaScript library, unlike other libraries that do the
same thing. The main benefit of being pure JavaScript is that you can
use it in a browser environment.

For Node.js-only projects, consider looking into these C extensions:

- [bignum](https://github.com/justmoon/node-bignum)
- [bigint](https://github.com/substack/node-bigint)


Example
-------

```js
> var bigint = require('bigintjs');

> bigint('99999999999999999999999999999').add('1').toString();
'100000000000000000000000000000'

> bigint('123456789012345678901234567890').multiply('98765432109876543210987654321').toString();
'12193263113702179522618503273362292333223746380111126352690'

> // Bitwise operations on a big number (JavaScript only supports up to 32 bits)
> bigint('0xFFFFFFFFFFFFFFFF').and('0xF0F0F0F0F0F0F0F0').shiftLeft(8).toString();
'4444580219171430789120'
```


This project is in an early state
---------------------------------

Some basic operations are still missing. Most notably:

- Division (and modulus), but you can use bit shifting for powers of 2
- Comparison (greater than / less than)
- Square root

Feel free to submit a pull request for any of the above.


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
