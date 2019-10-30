[![Build Status](https://travis-ci.org/hxxcxxx/fromise.svg?branch=master)](https://travis-ci.org/hxxcxxx/fromise)

# fromise

Fake implementation of Promise using double linked list.

## Install
npm install fromise`

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
  .catch(err => console.log(err));

// [ 'A', 'B', 'C', 'D' ]
```
