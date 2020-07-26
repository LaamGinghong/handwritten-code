class Promise {
  static resolvePromise(promise1, promise2, resolve, reject) {
    if (promise1 === promise2) reject("Chaining cycle detected for Promise");
    if (promise2 instanceof Promise) {
      promise2.then(resolve, reject);
    } else {
      resolve(promise2);
    }
  }

  /**
   * 终值
   * @type {*}
   */
  value = null;

  /**
   * 据因
   * @type {string}
   */
  reason;

  /**
   * 状态
   * @type {"pending"|"fulfilled"|"rejected"}
   */
  state = "pending";

  /**
   * 异步成功回调
   * @type {Function[]}
   */
  onFulfilledCallback = [];

  /**
   * 异步失败回调
   * @type {Function[]}
   */
  onRejectedCallback = [];

  constructor(executor) {
    this.init();
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  init() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }

  /**
   * 成功函数
   * @param value {*}
   */
  resolve(value) {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.value = value;

      this.onFulfilledCallback.forEach((fn) => {
        fn(this.value);
      });
    }
  }

  /**
   * 失败函数
   * @param reason {string}
   */
  reject(reason) {
    if (this.state === "pending") {
      this.state = "rejected";
      this.reason = reason;

      this.onRejectedCallback.forEach((fn) => {
        fn(this.reason);
      });
    }
  }

  then(onFulfilled, onRejected) {
    if (!onFulfilled) {
      onFulfilled = function (value) {
        return value;
      };
    }
    if (!onRejected) {
      onRejected = function (reason) {
        throw reason;
      };
    }

    const promise = new Promise((resolve, reject) => {
      if (this.state === "fulfilled") {
        try {
          const result = onFulfilled(this.value);
          Promise.resolvePromise(promise, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }

      if (this.state === "rejected") {
        try {
          onRejected(this.reason);
        } catch (e) {
          reject(e);
        }
      }

      if (this.state === "pending") {
        this.onFulfilledCallback.push((value) => {
          try {
            const result = onFulfilled(value);
            Promise.resolvePromise(promise, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

        this.onRejectedCallback.push((reason) => {
          try {
            onRejected(reason);
          } catch (e) {
            reject(e);
          }
        });
      }
    });
    return promise;
  }
}
