function throttling(fn, delay) {
  let flag = true;
  return function () {
    if (!flag) return;
    flag = false;
    setTimeout(function () {
      fn();
      flag = true;
    }, delay);
  };
}
