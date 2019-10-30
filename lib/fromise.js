const events = require('events');

const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

function isFunc(val) {
  return typeof val === 'function';
}

function isArray(val) {
  return val instanceof Array;
}

function isFromise(val) {
  return val instanceof Fromise;
}

function numOfFromises(arr) {
  return arr.filter(f => isFromise(f)).length;
}

const nodes = Symbol('nodes');
const addNode = Symbol('addNode');

class Fromise {
  constructor(executor) {
    if (!isFunc(executor)) {
      throw new TypeError('Invalid argument. executor type must be a function.');
    }

    const first = new FromiseNode();
    this[nodes] = first;

    try {
      executor(
        result => first.react(result, STATE.FULFILLED), // resolve()
        error => first.react(error, STATE.REJECTED), // reject()
      );
    } catch (err) {
      first.react(err, STATE.REJECTED);
    }
  }

  [addNode](onFulfilled, onRejected, isFinally = false) {
    const newNode = new FromiseNode(onFulfilled, onRejected, isFinally);
    this[nodes].addToTail(newNode);

    if (newNode.prev.state !== STATE.PENDING) {
      newNode.react(newNode.prev.result, newNode.prev.state);
    }

    return this;
  }

  then(onFulfilled) {
    if (!isFunc(onFulfilled)) {
      throw new TypeError('Invalid argument. handler type must be a function.');
    }
    return this[addNode](onFulfilled, undefined);
  }

  catch(onRejected) {
    if (!isFunc(onRejected)) {
      throw new TypeError('Invalid argument. handler type must be a function.');
    }
    return this[addNode](undefined, onRejected);
  }

  finally(onFinally) {
    if (!isFunc(onFinally)) {
      throw new TypeError('Invalid argument. handler type must be a function.');
    }
    return this[addNode](onFinally, undefined, true);
  }

  static resolve(result) {
    return new Fromise(resolve => resolve(result));
  }

  static reject(error) {
    return new Fromise((_, reject) => reject(error));
  }

  static race(fromises) {
    if (!isArray(fromises) || fromises.length !== numOfFromises(fromises)) {
      throw new TypeError(
        'Invalid argument. fromises must cotain only Fromise objects',
      );
    }
    return new Fromise((resolve, reject) => {
      fromises.map(f => f.then(res => resolve(res)).catch(err => reject(err)));
    });
  }

  static all(fromises) {
    if (!isArray(fromises) || fromises.length !== numOfFromises(fromises)) {
      throw new TypeError(
        'Invalid argument. fromises must cotain only Fromise objects',
      );
    }
    return new Fromise((resolve, reject) => {
      const results = new Array(fromises.length).fill(undefined);

      let resolveCnt = 0;
      const e = new events.EventEmitter().on('resolved', () => {
        if (++resolveCnt >= fromises.length) resolve(results);
      });

      fromises.map((f, i) =>
        f
          .then(res => {
            results[i] = res;
            e.emit('resolved');
          })
          .catch(err => reject(err)),
      );
    });
  }
}

module.exports = Fromise;

class DLL {
  constructor() {
    this.prev = undefined;
    this.next = undefined;
  }

  getHead() {
    let curr = this;
    while (curr.prev) curr = curr.prev;
    return curr;
  }

  getTail() {
    let curr = this;
    while (curr.next) curr = curr.next;
    return curr;
  }

  addToTail(node) {
    const tail = this.getTail();
    tail.next = node;
    node.prev = tail;
  }

  link(list) {
    if (list && list instanceof DLL) {
      const head = list.getHead();
      const tail = list.getTail();
      head.prev = this.prev;
      this.prev = tail;
      tail.next = this;
    }
  }
}

class FromiseNode extends DLL {
  constructor(onFulfilled, onRejected, isFinally) {
    super();

    this.result = undefined;
    this.state = STATE.PENDING;

    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
    this.isFinally = isFinally || false;
  }

  onLast() {
    if (this.state === STATE.REJECTED || this.result instanceof Error) {
      console.error('Unhandled Fromise Rejection Warning:', this.result);
    }
  }

  react(prevRes, prevState) {
    if (this.state !== STATE.PENDING) return;

    if (isFromise(prevRes) && prevState === STATE.FULFILLED) {
      this.link(prevRes[nodes]);

      prevRes = this.prev.result;
      prevState = this.prev.state;

      if (prevState === STATE.PENDING) return;
    }

    const task = () => {
      try {
        // handle finally(...)
        if (this.isFinally && isFunc(this.onFulfilled)) {
          this.onFulfilled();
          this.result = prevRes;
          this.state = prevState;
        }
        // handle then(...), when prev state is "fulfilled".
        else if (prevState === STATE.FULFILLED && isFunc(this.onFulfilled)) {
          this.result = this.onFulfilled(prevRes);
          this.state = STATE.FULFILLED;
        }
        // handle catch(...), when prev state is "rejected".
        else if (prevState === STATE.REJECTED && isFunc(this.onRejected)) {
          this.result = this.onRejected(prevRes);
          this.state = STATE.FULFILLED;
        }
        // when call resolve or reject in a Fromise.
        else {
          this.result = prevRes;
          this.state = prevState;
        }
      } catch (err) {
        this.result = err;
        this.state = STATE.REJECTED;
      }

      if (this.next) {
        this.next.react(this.result, this.state);
      } else {
        this.onLast();
      }
    };

    setTimeout(task, 0);
  }
}
