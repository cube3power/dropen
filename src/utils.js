export const stopEvent = function(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
};

export const addClass = function(to, className) {
  if (className) {
    if (!to.classList.contains(className)) {
      to.classList.add(className);
    }
  }
};


export const removeClass = function(to, className) {
  if (className) {
    if (to.classList.contains(className)) {
      to.classList.remove(className);
    }
  }
};

export const makeElement = function(el) {
  if (el instanceof HTMLElement) {
    return el;
  }
  if (typeof el === 'string') {
    var _el = document.querySelector(el);
    if (!_el) {
      throw Error('Not found in document.querySelector(el)');
    }
    return _el;
  }
  throw TypeError('"el" is not HTMLElement or valid selector.');
};

export const escapeHTML = function(str) {
  return typeof str !== 'string' ? str :
    str.replace(/[&'`"<>]/g, function(match) {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;'
      }[match];
    });
};
