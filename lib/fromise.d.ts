// Type definitions for Fromise 1.0
// Definitions by: hxxcxxx <https://github.com/hxxcxxx>

declare class Fromise {
  /**
   * Creates a new Fromise with a callback to handle some asynchronous task.
   * @param executor  A callback for the resolving or rejecting
   * the Fromise according to the result of asynchronous task.
   * @returns A new Fromise.
   */
  constructor(
    executor: (
      resolve?: (value: any) => any,
      reject?: (reason: any) => any
    ) => void
  );

  /**
   * Attaches a callback for the resolving of the Fromise.
   * @param onFulfilled The callback to execute when the Fromise is resolved.
   * @returns A Fromise the callback is attached.
   */
  then(onFulfilled: (result: any) => any): this;

  /**
   * Attaches a callback for the rejection of the Fromise.
   * @param onRejected The callback to execute when the Fromise is rejected.
   * @returns A Fromise the callback is attached.
   */
  catch(onRejected: (error: any) => any): this;

  /**
   * Attaches a callback is called regardless of the state of the Fromise.
   * @param onFinally The callback to execute regardless of the state of the Fromise.
   * @returns A Fromise the callback is attached.
   */
  finally(onFinally: () => void): this;

  /**
   * Creates a new resolved Fromise for the provided value.
   * @param value The value to resolve the Fromise.
   * @returns A new resolved Fromise.
   */
  static resolve(value: any): Fromise;

  /**
   * Creates a new rejected Fromise for the provided reason.
   * @param reason The reason the Fromise was rejected.
   * @returns A new rejected Fromise.
   */
  static reject(reason: any): Fromise;

  /**
   * Creates a Fromise is resolved or rejected,
   * when one of fromise is resolved or rejected in the array.
   * @param fromises An array of Fromises.
   * @returns A new Fromise.
   */
  static race(fromises: Array<Fromise>): Fromise;

  /**
   * Creates a Fromise that is resolved, when all of fromises are resolved in the array.
   * if some fromise is rejected in the array, the Fromise will be rejected.
   * @param fromises An array of Fromises.
   * @returns A new Fromise.
   */
  static all(fromises: Array<Fromise>): Fromise;
}

export = Fromise;
