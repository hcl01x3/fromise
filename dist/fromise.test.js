"use strict";

/* eslint-env jest */
var Fromise = require('./fromise');
/** Fromise method test */


describe('Test of Fromise then, catch, finally methods', function () {
  test('resolve & then(onFulfilled, ...)', function () {
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
  test('reject & then(..., onRejected)', function () {
    // for Jest async test verification.
    return new Promise(function (onDone) {
      new Fromise(function (_, reject) {
        reject(new Error());
      }).then(function () {
        return onDone();
      }, function (err) {
        return onDone(err);
      });
    }).then(function (testResult) {
      return expect(testResult).toBeInstanceOf(Error);
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