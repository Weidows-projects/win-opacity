/* Bindings for relevant user32 functions */
const ffi = require('ffi');
const ref = require('ref');
const t = require('./types');

module.exports = ffi.Library('user32', {
  EnumWindows: [
    t.BOOL,
    [t.ptr.void, t.LPARAM]
  ],
  GetWindowTextW: [
    ref.types.int,
    [t.HWND, t.ptr.string, ref.types.int]
  ],
  GetWindowLongA: [
    t.LONG,
    [t.HWND, ref.types.int]
  ],
  SetWindowLongA: [
    t.LONG,
    [t.HWND, ref.types.int, t.LONG]
  ],
  SetLayeredWindowAttributes: [
    t.BOOL,
    [t.HWND, t.COLORREF, t.BYTE, t.DWORD]
  ],
  GetLayeredWindowAttributes: [
    t.BOOL, 
    [t.HWND, t.ptr.COLORREF, t.ptr.BYTE, t.ptr.DWORD]
  ],
  IsWindowVisible: [
    t.BOOL,
    [t.HWND]
  ],
  GetAncestor: [
    t.HWND,
    [t.HWND, t.UINT]
  ],
  GetLastActivePopup: [
    t.HWND,
    [t.HWND]
  ],
});