"use strict";

/* eslint-env jest */
var Fromise = require('./fromise');
/** Fromise method test */


describe('Test of Fromise then, catch, finally methods', function () {
  test('resolve & then(...)', function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (resolve) {
        return resolve(0);
      }).then(function (res) {
        return onDone(++res);
      });
    }).then(function (testResult) {
      expect(testResult).toBe(1);
    });
  });
  test('reject & catch(...)', function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (_, reject) {
        reject(new Error());
      })["catch"](function (err) {
        return onDone(err);
      });
    }).then(function (testResult) {
      return expect(testResult).toBeInstanceOf(Error);
    });
  });
  test('reject & catch(...) & finally(...)', function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      var test = [];
      new Fromise(function (_, reject) {
        reject(new Error());
      })["catch"](function (err) {
        return test.push(err);
      })["finally"](function () {
        test.push(true);
        onDone(test);
      });
    }).then(function (testResult) {
      return expect(testResult).toEqual([new Error(), true]);
    });
  });
  test('resolve & then(...) with throw error & catch(...) & then(...)', function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      var test = [];
      new Fromise(function (resolve) {
        resolve(1);
      }).then(function (res) {
        test.push(res);
        throw new Error();
      })["catch"](function (err) {
        test.push(err);
      }).then(function (res) {
        test.push(res);
        onDone(test);
      });
    }).then(function (testResult) {
      return expect(testResult).toEqual([1, new Error(), undefined]);
    });
  });
});
describe('nested fromises', function () {
  test("resolve with a resloved fromise", function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (resolve) {
        resolve(new Fromise(function (resolve) {
          return resolve(0);
        }).then(function (res) {
          return ++res;
        }));
      }).then(function (res) {
        onDone(++res);
      });
    }).then(function (testResult) {
      return expect(testResult).toBe(2);
    });
  });
  test("reject with a resloved fromise", function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (_, reject) {
        reject(new Fromise(function (resolve) {
          return resolve(0);
        }).then(function (res) {
          return ++res;
        }));
      })["catch"](function (res) {
        if (res instanceof Fromise) onDone(true);else onDone(false);
      });
    }).then(function (testResult) {
      return expect(testResult).toBe(true);
    });
  });
  test("then with a resloved fromise", function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (resolve) {
        resolve(0);
      }).then(function (res) {
        return new Fromise(function (resolve) {
          return resolve(++res);
        }).then(function (res) {
          return ++res;
        });
      }).then(function (res) {
        return onDone(++res);
      });
    }).then(function (testResult) {
      return expect(testResult).toBe(3);
    });
  });
});