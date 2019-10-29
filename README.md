# fromise

Fake implementation of Promise using double linked list.

### Simple example

```js
const Fromise = require('fromise');

const p = new Fromise((resolve, reject) => {
  // async job
  resolve(result);
  // if something wrong
  reject(error);
})
.then(result => console.log(result))
.catch(error => console.error(error))
.finally(() => console.log('finally'))

```
