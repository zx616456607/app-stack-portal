/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * query string
 * https://github.com/sorrycc/blog/issues/68
 * v0.1 - 2018-04-19
 * @author Zhangpc
 */

'use strict'
const strictUriEncode = require('strict-uri-encode');
const decodeComponent = require('decode-uri-component');

function encoderForArrayFormat(options) {
  switch (options.arrayFormat) {
    case 'index':
      return (key, value, index) => {
        return value === null ? [
          encode(key, options),
          '[',
          index,
          ']'
        ].join('') : [
          encode(key, options),
          '[',
          encode(index, options),
          ']=',
          encode(value, options)
        ].join('');
      };
    case 'bracket':
      return (key, value) => {
        return value === null ? encode(key, options) : [
          encode(key, options),
          '[]=',
          encode(value, options)
        ].join('');
      };
    default:
      return (key, value) => {
        return value === null ? encode(key, options) : [
          encode(key, options),
          '=',
          encode(value, options)
        ].join('');
      };
  }
}

function parserForArrayFormat(options) {
  let result;

  switch (options.arrayFormat) {
    case 'index':
      return (key, value, accumulator) => {
        result = /\[(\d*)\]$/.exec(key);

        key = key.replace(/\[\d*\]$/, '');

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = {};
        }

        accumulator[key][result[1]] = value;
      };
    case 'bracket':
      return (key, value, accumulator) => {
        result = /(\[\])$/.exec(key);
        key = key.replace(/\[\]$/, '');

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value];
          return;
        }

        accumulator[key] = [].concat(accumulator[key], value);
      };
    default:
      return (key, value, accumulator) => {
        if (accumulator[key] === undefined) {
          accumulator[key] = value;
          return;
        }

        accumulator[key] = [].concat(accumulator[key], value);
      };
  }
}

function encode(value, options) {
  if (options.encode) {
    return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
  }

  return value;
}

function keysSorter(input) {
  if (Array.isArray(input)) {
    return input.sort();
  }

  if (typeof input === 'object') {
    return keysSorter(Object.keys(input))
      .sort((a, b) => Number(a) - Number(b))
      .map(key => input[key]);
  }

  return input;
}

function extract(input) {
  const queryStart = input.indexOf('?');
  if (queryStart === -1) {
    return '';
  }
  return input.slice(queryStart + 1);
}

function parse(input, options) {
  options = Object.assign({ arrayFormat: 'none' }, options);

  const formatter = parserForArrayFormat(options);

  // Create an object with no prototype
  const ret = Object.create(null);

  if (typeof input !== 'string') {
    return ret;
  }

  input = input.trim().replace(/^[?#&]/, '');

  if (!input) {
    return ret;
  }

  for (const param of input.split('&')) {
    let [key, value] = param.replace(/\+/g, ' ').split('=');

    // Missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value = value === undefined ? null : decodeComponent(value);

    formatter(decodeComponent(key), value, ret);
  }

  return Object.keys(ret).sort().reduce((result, key) => {
    const value = ret[key];
    if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
      // Sort object keys, not values
      result[key] = keysSorter(value);
    } else {
      result[key] = value;
    }

    return result;
  }, Object.create(null));
}

const stringify = (obj, options) => {
  const defaults = {
    encode: true,
    strict: true,
    arrayFormat: 'none'
  };

  options = Object.assign(defaults, options);

  if (options.sort === false) {
    options.sort = () => { };
  }

  const formatter = encoderForArrayFormat(options);

  return obj ? Object.keys(obj).sort(options.sort).map(key => {
    const value = obj[key];

    if (value === undefined) {
      return '';
    }

    if (value === null) {
      return encode(key, options);
    }

    if (Array.isArray(value)) {
      const result = [];

      for (const value2 of value.slice()) {
        if (value2 === undefined) {
          continue;
        }

        result.push(formatter(key, value2, result.length));
      }

      return result.join('&');
    }

    return encode(key, options) + '=' + encode(value, options);
  }).filter(x => x.length > 0).join('&') : '';
};

const parseUrl = (input, options) => {
  return {
    url: input.split('?')[0] || '',
    query: parse(extract(input), options)
  };
};

export default { extract, parse, stringify, parseUrl }
