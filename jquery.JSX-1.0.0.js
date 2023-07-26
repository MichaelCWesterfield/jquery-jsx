/* Dependencies: JQuery, Babel */
/** @jsx $.createElement */
/*** @jsxFrag $.createFragment */

// Create a helper function to convert JSX-like syntax to jQuery objects
$.createElement = function (tag, props, ...children) {
  const appendChild = function (parent, child) {
    if (child instanceof Array) {
      for (const nestedChild of child) {
        appendChild(parent, nestedChild);
      }
    } else {
      parent.appendChild(
        typeof child === "object" && child.nodeType
          ? child
          : document.createTextNode(child)
      );
    }
  };

  if (typeof tag === "function") return tag(props, ...children);
  const element = document.createElement(tag);

  for (const name in props) {
    if (props.hasOwnProperty(name)) {
      const value = props[name];
      const lowercaseName = name.toLowerCase();
      if (lowercaseName.startsWith("on") && lowercaseName in window) {
        element.addEventListener(lowercaseName.substr(2), value);
      } else {
        element.setAttribute(name, value.toString());
      }
    }
  }

  const childrenLength = children.length;
  for (let i = 0; i < childrenLength; i++) {
    appendChild(element, children[i]);
  }

  return element;
};

$.createFragment = function (...children) {
  return $.createElement("fragment", null, ...children);
};

$.fn.render = function (Component) {
  $(this).empty().append(Component);
};

(function ($) {
  $.fn.useState = function (initialValue, Component) {
    let state = initialValue;
    let currentElement = $(this);

    function setState(newState) {
      state = newState;

      // Trigger a re-render of the JSX component
      $(currentElement.parent()).render(Component());
    }

    return [state, setState];
  };
})(jQuery);

$.fn.useContext = function (object, property, elementProperty) {
  let elements = this;
  let value = object[property]; // Store the initial property value

  function updateElement() {
    elements.each(function () {
      $(this).prop(elementProperty, value);
    });
  }

  Object.defineProperty(object, property, {
    get: function () {
      return value; // Return the stored value
    },
    set: function (newValue) {
      value = newValue; // Update the stored value
      setTimeout(updateElement, 0); //Defer function execution to prevent call stack overflow error
    },
  });

  updateElement();

  return this;
};
