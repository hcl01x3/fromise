const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

function isFunc(val) {
  return typeof val === 'function';
}

module.exports = class Fromise {
  constructor(executor) {
    const first = new FromiseNode();
    this.nodes = first;

    try {
      executor(
        result => first.react(result, STATE.FULFILLED), // reslove()
        error => first.react(error, STATE.REJECTED), // reject()
      );
    } catch (err) {
      first.react(err, STATE.REJECTED);
    }
  }

  addNode(onFulfilled, onRejected, isFinally = false) {
    const newNode = new FromiseNode(onFulfilled, onRejected, isFinally);
    this.nodes.addToTail(newNode);

    if (newNode.prev.state !== STATE.PENDING) {
      newNode.react(newNode.prev.result, newNode.prev.state);
    }

    return this;
  }

  then(onFulfilled, onRejected) {
    return this.addNode(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.addNode(undefined, onRejected);
  }

  finally(onFinally) {
    return this.addNode(onFinally, undefined, true);
  }
};

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

  react(prevRes, prevState) {
    if (this.state !== STATE.PENDING) return;

    const task = () => {
      try {
        // handle finally(...)
        if (this.isFinally && isFunc(this.onFulfilled)) {
          this.onFulfilled();
          this.result = prevRes;
          this.state = prevState;
        }
        // handle then(onFulfilled, ...), when prev state is "fulfilled".
        else if (prevState === STATE.FULFILLED && isFunc(this.onFulfilled)) {
          this.result = this.onFulfilled(prevRes);
          this.state = STATE.FULFILLED;
        }
        // handle then(..., onRejected) or catch(...), when prev state is "rejected".
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
      }
    };

    setTimeout(task, 0);
  }
}
