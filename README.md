[![Build Status](https://travis-ci.org/hxxcxxx/fromise.svg?branch=master)](https://travis-ci.org/hxxcxxx/fromise)

# fromise

Fake implementation of Promise using double linked list.

## Install
`npm install fromise`

## Usage

```js
const Fromise  = require('fromise');
```

## Usage Examples

### Standalone fromise

```js
const Fromise = require('fromise');

const f = new Fromise((resolve, reject) => {
  // do async task.
  // if something wrong
  // reject(new Error());
  resolve('done');
})
  .then(res => console.log(res))
  .catch(err => console.error(err))
  .finally(() => console.log('finally'))

// done
// finally
```

### Nested fromises

```js
const Fromise = require('fromise');

const f = new Fromise(resolve => resolve(['A']))
  .then(res => {
    return new Fromise(resolve => {
      res.push('B');
      resolve(res);
    })
      .then(res => {
        res.push('C');
        return res;
      })
      .catch(err => err);
  })
  .then(res => {
    res.push('D');
    return res;
  })
  .then(res => console.log(res))
  .catch(err => console.error(err));

// [ 'A', 'B', 'C', 'D' ]
```

### Resolve, Reject fromise
```js
const Fromise = require('fromise');

Fromise.resolve('resolve').then(res => console.log(res));
Fromise.reject('reject').catch(err => console.error(err));
```

### Race, All fromises

```js
const Fromise = require('fromise');

Fromise.all([
  new Fromise(resolve => resolve('A')),
  new Fromise(resolve => resolve('B')),
  new Fromise(resolve => resolve('C')),
])
  .then(res => console.log(res))
  .catch(err => console.error(err));

// [ 'A', 'B', C' ]


// for race test.
const sleep = (val, ms) =>
  new Fromise(resolve => setTimeout(() => resolve(val), ms));

Fromise.race([
  sleep('200ms', 200),
  sleep('120ms', 120),
  sleep('110ms', 110),
  sleep('115ms', 115)
])
  .then(res => console.log(res))
  .catch(err => console.error(err));

// 110ms
```
