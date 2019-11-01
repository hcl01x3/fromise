"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
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
  return arr.filter(function (f) {
    return isFromise(f);
  }).length;
}

var nodes = Symbol('nodes');
var addNode = Symbol('addNode');

var Fromise =
/*#__PURE__*/
function () {
  function Fromise(executor) {
    _classCallCheck(this, Fromise);

    if (!isFunc(executor)) {
      throw new TypeError('Invalid argument. executor type must be a function.');
    }

    var first = new FromiseNode();
    this[nodes] = first;

    try {
      executor(function (value) {
        return first.react(value, STATE.FULFILLED);
      }, // resolve()
      function (reason) {
        return first.react(reason, STATE.REJECTED);
      } // reject()
      );
    } catch (err) {
      first.react(err, STATE.REJECTED);
    }
  }

  _createClass(Fromise, [{
    key: addNode,
    value: function value(onFulfilled, onRejected) {
      var isFinally = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var newNode = new FromiseNode(onFulfilled, onRejected, isFinally);
      this[nodes].addToTail(newNode);

      if (newNode.prev.state !== STATE.PENDING) {
        newNode.react(newNode.prev.result, newNode.prev.state);
      }

      return this;
    }
  }, {
    key: "then",
    value: function then(onFulfilled, onRejected) {
      if (!isFunc(onFulfilled) || onRejected && !isFunc(onRejected)) {
        throw new TypeError('Invalid argument. handler type must be a function.');
      }

      return this[addNode](onFulfilled, onRejected);
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      if (!isFunc(onRejected)) {
        throw new TypeError('Invalid argument. handler type must be a function.');
      }

      return this[addNode](undefined, onRejected);
    }
  }, {
    key: "finally",
    value: function _finally(onFinally) {
      if (!isFunc(onFinally)) {
        throw new TypeError('Invalid argument. handler type must be a function.');
      }

      return this[addNode](onFinally, undefined, true);
    }
  }], [{
    key: "resolve",
    value: function resolve(value) {
      return new Fromise(function (resolve) {
        return resolve(value);
      });
    }
  }, {
    key: "reject",
    value: function reject(reason) {
      return new Fromise(function (_, reject) {
        return reject(reason);
      });
    }
  }, {
    key: "race",
    value: function race(fromises) {
      if (!isArray(fromises) || fromises.length !== numOfFromises(fromises)) {
        throw new TypeError('Invalid argument. fromises must cotain only Fromise objects');
      }

      return new Fromise(function (resolve, reject) {
        fromises.map(function (f) {
          return f.then(function (value) {
            return resolve(value);
          })["catch"](function (reason) {
            return reject(reason);
          });
        });
      });
    }
  }, {
    key: "all",
    value: function all(fromises) {
      if (!isArray(fromises) || fromises.length !== numOfFromises(fromises)) {
        throw new TypeError('Invalid argument. fromises must cotain only Fromise objects');
      }

      return new Fromise(function (resolve, reject) {
        var allResults = new Array(fromises.length).fill(undefined);
        var resolveCnt = 0;

        var updateResult = function updateResult(val, idx) {
          allResults[idx] = val;
          if (++resolveCnt >= fromises.length) resolve(allResults);
        };

        fromises.map(function (f, i) {
          return f.then(function (value) {
            return updateResult(value, i);
          })["catch"](function (reason) {
            return reject(reason);
          });
        });
      });
    }
  }]);

  return Fromise;
}();

var DLL =
/*#__PURE__*/
function () {
  function DLL() {
    _classCallCheck(this, DLL);

    this.prev = undefined;
    this.next = undefined;
  }

  _createClass(DLL, [{
    key: "getHead",
    value: function getHead() {
      var curr = this;

      while (curr.prev) {
        curr = curr.prev;
      }

      return curr;
    }
  }, {
    key: "getTail",
    value: function getTail() {
      var curr = this;

      while (curr.next) {
        curr = curr.next;
      }

      return curr;
    }
  }, {
    key: "addToTail",
    value: function addToTail(node) {
      var tail = this.getTail();
      tail.next = node;
      node.prev = tail;
    }
  }, {
    key: "link",
    value: function link(list) {
      if (list && list instanceof DLL) {
        var head = list.getHead();
        var tail = list.getTail();
        head.prev = this.prev;
        if (this.prev) this.prev.next = head;
        this.prev = tail;
        tail.next = this;
      }
    }
  }]);

  return DLL;
}();

var FromiseNode =
/*#__PURE__*/
function (_DLL) {
  _inherits(FromiseNode, _DLL);

  function FromiseNode(onFulfilled, onRejected, isFinally) {
    var _this;

    _classCallCheck(this, FromiseNode);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FromiseNode).call(this));
    _this.result = undefined;
    _this.state = STATE.PENDING;
    _this.onFulfilled = onFulfilled;
    _this.onRejected = onRejected;
    _this.isFinally = isFinally || false;
    return _this;
  }

  _createClass(FromiseNode, [{
    key: "onLast",
    value: function onLast() {
      if (this.state === STATE.REJECTED || this.result instanceof Error) {
        console.error('Unhandled Fromise Rejection Warning:', this.result);
      }
    }
  }, {
    key: "react",
    value: function react(prevRes, prevState) {
      var _this2 = this;

      if (this.state !== STATE.PENDING) return;

      if (isFromise(prevRes) && prevState === STATE.FULFILLED) {
        this.link(prevRes[nodes]);
        prevRes = this.prev.result;
        prevState = this.prev.state;
        if (prevState === STATE.PENDING) return;
      }

      var task = function task() {
        try {
          // handle finally(...)
          if (_this2.isFinally && isFunc(_this2.onFulfilled)) {
            _this2.onFulfilled();

            _this2.result = prevRes;
            _this2.state = prevState;
          } // handle then(...), when prev state is "fulfilled".
          else if (prevState === STATE.FULFILLED && isFunc(_this2.onFulfilled)) {
              _this2.result = _this2.onFulfilled(prevRes);
              _this2.state = STATE.FULFILLED;
            } // handle catch(...), when prev state is "rejected".
            else if (prevState === STATE.REJECTED && isFunc(_this2.onRejected)) {
                _this2.result = _this2.onRejected(prevRes);
                _this2.state = STATE.FULFILLED;
              } // when call resolve or reject in a Fromise.
              else {
                  _this2.result = prevRes;
                  _this2.state = prevState;
                }
        } catch (err) {
          _this2.result = err;
          _this2.state = STATE.REJECTED;
        }

        if (_this2.next) {
          _this2.next.react(_this2.result, _this2.state);
        } else {
          _this2.onLast();
        }
      };

      setTimeout(task, 0);
    }
  }]);

  return FromiseNode;
}(DLL);

module.exports = Fromise;