exports.copy = copy;
exports.normalized = normalized;

/**
 * Returns a typed array containing the data from the source array, with the
 * bits converted from/to the specified bit sizes.
 *
 * If a destination array is passed in, the values will be written at the end of
 * it (since values are stored in MSB first order). Values will not be cleared
 * beforehand – that is up to the caller.
 */
function copy(fromArray, fromBits, toBits, opt_destArray) {
  if (fromBits < 1 || fromBits > 32 || toBits < 1 || toBits > 32) {
    throw new Error('Bits per item must be in range 1–32');
  }

  var firstIndex = 0,
      numItems = fromArray.length;

  // Skip to the first non-zero value.
  while (!fromArray[firstIndex] && firstIndex < numItems) firstIndex++;

  // Figure out how many bits are actually in use in the first value.
  var firstBits = 1;
  while (fromArray[firstIndex] >>> firstBits && firstBits < 32) {
    firstBits++;
  }

  // Calculate the number of "from" values, bits and "to" values needed.
  var totalBits = Math.max(numItems - firstIndex - 1, 0) * fromBits + firstBits,
      valuesToFill = Math.ceil(totalBits / toBits);

  var toArray;
  if (opt_destArray) {
    // Assume that the user is passing in a compatible array.
    toArray = opt_destArray;
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

    toArray = new ArrayClass(valuesToFill);
  }

  if (toArray.length < valuesToFill) {
    throw new Error('Destination array is too small');
  }

  var mask = toBits == 32 ? 0xFFFFFFFF : (1 << toBits >>> 0) - 1,
      bits = 0,
      a = fromArray.length - 1,
      b = toArray.length - 1;

  while (a >= firstIndex) {
    var value = fromArray[a--];
    if (bits < 0) {
      toArray[b + 1] = (toArray[b + 1] | (value << (toBits + bits) >>> 0 & mask)) >>> 0;
      value = value >>> -bits;
    }
    bits += fromBits;
    while (bits > 0) {
      if (b >= 0) {
        toArray[b--] = (value & mask) >>> 0;
        value = value >>> toBits;
      }
      bits -= toBits;
    }
  }

  // Zero out the rest of the array.
  while (b >= 0) toArray[b--] = 0;

  return toArray;
}

function normalized(array) {
  var index = 0;
  while (!array[index] && index < array.length) index++;
  return index ? array.subarray(index) : array;
}
