/* eslint-env jest */
const Fromise = require('./fromise');

/** Fromise method test */
describe('then, catch, finally methods', () => {
  test('resolve & then(...)', () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      new Fromise(resolve => resolve(0)).then(res => onDone(++res));
    }).then(testResult => {
      expect(testResult).toBe(1);
    });
  });

  test('reject & catch(...)', () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      new Fromise((_, reject) => {
        reject(new Error());
      }).catch(err => onDone(err));
    }).then(testResult => expect(testResult).toBeInstanceOf(Error));
  });

  test('reject & catch(...) & finally(...)', () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      const test = [];

      new Fromise((_, reject) => {
        reject(new Error());
      })
        .catch(err => test.push(err))
        .finally(() => {
          test.push(true);
          onDone(test);
        });
    }).then(testResult => expect(testResult).toEqual([new Error(), true]));
  });

  test('resolve & then(...) with throw error & catch(...) & then(...)', () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      const test = [];

      new Fromise(resolve => {
        resolve(1);
      })
        .then(res => {
          test.push(res);
          throw new Error();
        })
        .catch(err => {
          test.push(err);
        })
        .then(res => {
          test.push(res);
          onDone(test);
        });
    }).then(testResult => expect(testResult).toEqual([1, new Error(), undefined]));
  });
});

describe('nested fromises', () => {
  test(`resolve with a resloved fromise`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      new Fromise(resolve => {
        resolve(new Fromise(resolve => resolve(0)).then(res => ++res));
      }).then(res => {
        onDone(++res);
      });
    }).then(testResult => expect(testResult).toBe(2));
  });

  test(`reject with a resloved fromise`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      new Fromise((_, reject) => {
        reject(new Fromise(resolve => resolve(0)).then(res => ++res));
      }).catch(res => {
        if (res instanceof Fromise) onDone(true);
        else onDone(false);
      });
    }).then(testResult => expect(testResult).toBe(true));
  });

  test(`then with a resloved fromise`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      new Fromise(resolve => {
        resolve(0);
      })
        .then(res => new Fromise(resolve => resolve(++res)).then(res => ++res))
        .then(res => onDone(++res));
    }).then(testResult => expect(testResult).toBe(3));
  });
});

describe('resolve, reject, race, all static methods', () => {
  test(`Fromise.resolve()`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      Fromise.resolve(true).then(res => onDone(res));
    }).then(testResult => expect(testResult).toBe(true));
  });

  test(`Fromise.reject()`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      Fromise.reject(new Error()).catch(err => onDone(err));
    }).then(testResult => expect(testResult).toBeInstanceOf(Error));
  });

  const sleep = (ms, val) =>
    new Promise(resolve => setTimeout(() => resolve(val), ms));

  test(`Fromise.race(...fromises)`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      Promise.race([sleep(300, 300), sleep(100, 100), sleep(200, 200)]).then(res =>
        onDone(res),
      );
    }).then(testResult => expect(testResult).toBe(100));
  });

  test(`Fromise.all(...fromises)`, () => {
    // for Jest async test verification.
    return new Promise(onDone => {
      Promise.all([sleep(300, 300), sleep(100, 100), sleep(200, 200)]).then(res =>
        onDone(res),
      );
    }).then(testResult => expect(testResult).toEqual([300, 100, 200]));
  });
});
