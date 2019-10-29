const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

function isFunc(val) {
  return typeof val === 'function';
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
        result => first.react(result, STATE.FULFILLED), // reslove()
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

    if (prevRes && prevRes instanceof Fromise && prevState === STATE.FULFILLED) {
      this.link(prevRes[nodes]);

      if (prevState === STATE.PENDING) return;

      prevRes = this.prev.result;
      prevState = this.prev.state;
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
