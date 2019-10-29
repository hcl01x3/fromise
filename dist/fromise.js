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

module.exports =
/*#__PURE__*/
function () {
  function Fromise(executor) {
    _classCallCheck(this, Fromise);

    var first = new FromiseNode();
    this.nodes = first;

    try {
      executor(function (result) {
        return first.react(result, STATE.FULFILLED);
      }, // reslove()
      function (error) {
        return first.react(error, STATE.REJECTED);
      } // reject()
      );
    } catch (err) {
      first.react(err, STATE.REJECTED);
    }
  }

  _createClass(Fromise, [{
    key: "addNode",
    value: function addNode(onFulfilled, onRejected) {
      var isFinally = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var newNode = new FromiseNode(onFulfilled, onRejected, isFinally);
      this.nodes.addToTail(newNode);

      if (newNode.prev.state !== STATE.PENDING) {
        newNode.react(newNode.prev.result, newNode.prev.state);
      }

      return this;
    }
  }, {
    key: "then",
    value: function then(onFulfilled, onRejected) {
      return this.addNode(onFulfilled, onRejected);
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      return this.addNode(undefined, onRejected);
    }
  }, {
    key: "finally",
    value: function _finally(onFinally) {
      return this.addNode(onFinally, undefined, true);
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
    key: "react",
    value: function react(prevRes, prevState) {
      var _this2 = this;

      if (this.state !== STATE.PENDING) return;

      var task = function task() {
        try {
          // handle finally(...)
          if (_this2.isFinally && isFunc(_this2.onFulfilled)) {
            _this2.onFulfilled();

            _this2.result = prevRes;
            _this2.state = prevState;
          } // handle then(onFulfilled, ...), when prev state is "fulfilled".
          else if (prevState === STATE.FULFILLED && isFunc(_this2.onFulfilled)) {
              _this2.result = _this2.onFulfilled(prevRes);
              _this2.state = STATE.FULFILLED;
            } // handle then(..., onRejected) or catch(...), when prev state is "rejected".
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
        }
      };

      setTimeout(task, 0);
    }
  }]);

  return FromiseNode;
}(DLL);