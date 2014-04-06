module.exports = arrayCopy;

/**
 * Returns a typed array containing the data from the source array, with the
 * bits converted from/to the specified bit sizes.
 *
 * If a destination array is passed in, the values will be written at the end of
 * it (since values are stored in MSB first order). Values will not be cleared
 * beforehand – that is up to the caller.
 */
function arrayCopy(fromArray, fromBits, toBits, opt_destArray) {
  if (fromBits < 1 || fromBits > 32 || toBits < 1 || toBits > 32) {
    throw new Error('Bits per item must be in range 1–32');
  }

  var dest, numItems = fromArray.length;

  var totalBits = numItems * fromBits,
      bytesToFill = Math.ceil(totalBits / toBits);

  if (opt_destArray) {
    // Assume that the user is passing in a compatible array.
    dest = opt_destArray;
  } else {
    // Pick the smallest possible typed array to hold the copied items.
    var ArrayClass;
    if (toBits > 16) {
      ArrayClass = Uint32Array;
    } else if (toBits > 8) {
      ArrayClass = Uint16Array;
    } else {
      ArrayClass = Uint8Array;
    }

    dest = new ArrayClass(bytesToFill);
  }

  var index = dest.length - bytesToFill,
      bits = totalBits % toBits || toBits,
      mask = toBits == 32 ? -1 >>> 0 : (1 << toBits >>> 0) - 1;

  if (index < 0) {
    throw new Error('Destination array is too small');
  }

  for (var i = 0; i < numItems; i++) {
    var value = fromArray[i];

    var overflow = fromBits - bits;

    if (overflow < 0) {
      dest[index] |= value << -overflow >>> 0 & mask;
    } else {
      dest[index] |= value >>> overflow & mask;
    }

    while (overflow > 0) {
      index++;

      if (overflow < toBits) {
        dest[index] = value << (toBits - overflow) >>> 0 & mask;
      } else {
        dest[index] = value >>> (overflow - toBits) & mask;
      }

      overflow -= toBits;
    }

    bits -= fromBits;
    while (bits < 0) bits += toBits;
  }

  return dest;
}
