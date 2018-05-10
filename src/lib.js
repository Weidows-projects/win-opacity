const ffi = require('ffi');
const ref = require('ref');
const user32 = require('./user32');

// C Constants
const GA_ROOTOWNER = 3;
const GWL_EXSTYLE = -20;
const LWA_ALPHA = 0x2;
const WS_EX_LAYERED = 0x80000;
const WS_EX_TOOLWINDOW = 0x00000080;

/**
 * A window handle. Essentially, a pointer
 * @typedef {number} WindowHandle
 */

/**
 * Contains information about a window
 * @typedef {Object} NativeWindow
 * @property {string} title - Title on the window
 * @property {WindowHandle} handle - The actual handle pointing to the window
 */

/**
 * Can a window be accessed via Alt+Tab?
 * @param {WindowHandle|NativeWindow} handle The window object or handle
 */
const isAltTabWindow = (handle) => {
  // If it's a window object, switch it to just the handle
  if (handle.handle) {
    handle = handle.handle;
  }

  // First see if the window is considered visible
  if (!user32.IsWindowVisible(handle)) {
    return false;
  }

  // Climb up through the layout tree to determine if it's root is visible
  let handleWalk = null;
  let attemptedHandle = user32.GetAncestor(handle, GA_ROOTOWNER);
  while (attemptedHandle !== handleWalk) {
    handleWalk = attemptedHandle;
    attemptedHandle = user32.GetLastActivePopup(handleWalk);
    if (user32.IsWindowVisible(attemptedHandle)) {
      break;
    }
  }

  if (handleWalk !== handle) {
    return false;
  }

  // Filter out tool windows
  if (user32.GetWindowLongA(handle, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) {
    return false;
  }

  return true;
};

// Stores all of the windows found in the getWindows function
let _windows = [];

// Called during EnumWindows
const getWindows = ffi.Callback('bool', ['long', 'int32'], 
  /**
   * @param {WindowHandle} hwnd
   */
  function(hwnd) {
    if (!isAltTabWindow(hwnd)) {
      return true;
    }

    // Load window title
    const buffer = new Buffer(255);
    user32.GetWindowTextW(hwnd, buffer, 255);
    const windowName = buffer.toString('utf16le').replace(/\u0000/g, '').trim();

    if (!windowName) {
      return true;
    }

    // Provide the windows title and original handle
    _windows.push({
      title: windowName,
      handle: hwnd
    });
    return true;
  });

/**
 * Returns all visible windows
 * @returns {NativeWindow[]}
 */
exports.getWindows = function() {
  _windows = [];
  user32.EnumWindows(getWindows, 0);
  return _windows;
};

/**
 * Sets the opacity of a given window
 * @param {NativeWindow|WindowHandle} handle 
 * @param {number} opacity Must be [0-255]
 */
exports.setOpacity = function(handle, opacity) {
  if (typeof handle !== 'number') {
    if (handle.title && handle.handle) {
      handle = handle.handle;
    } else {
      throw new Error('Must provide a handle of window');
    }
  } else if (handle === null) {
    throw new Error('Handle cannot be null');
  }

  // Make sure the opacity is a valid value
  if (typeof opacity !== 'number' || opacity < 0 || opacity > 255) {
    throw new Error('Must provide an opacity value between 0 and 255');
  }

  // Take the floor of the number to remove any floating point bits
  opacity = opacity | 0;

  // Set the opacity
  const windowLong = user32.GetWindowLongA(handle, GWL_EXSTYLE);
  user32.SetWindowLongA(handle, GWL_EXSTYLE, windowLong | WS_EX_LAYERED);
  return user32.SetLayeredWindowAttributes(handle, 0, opacity, LWA_ALPHA);
};

/**
 * Returns the opacity of a window
 * @param {NativeWindow|WindowHandle} handle 
 * @returns {number} Number is [0-255]
 */
exports.getOpacity = function(handle) {
  if (typeof handle !== 'number') {
    if (handle.title && handle.handle) {
      handle = handle.handle;
    } else {
      throw new Error('Must provide a handle of window');
    }
  } else if (handle === null) {
    throw new Error('Handle cannot be null');
  }

  let outKey = ref.alloc('ulong');
  let outAlpha = ref.alloc('byte');
  let outFlags = ref.alloc('ulong');
  user32.GetLayeredWindowAttributes(handle, outKey, outAlpha, outFlags);
  const alpha = outAlpha.deref();
  if (alpha === 0) {
    return 255;
  }
  return alpha;
};