const ref = require('ref');

// Type aliases
const BOOL = ref.types.bool;
const BYTE = ref.types.uchar;
const DWORD = ref.types.ulong;
const HWND = ref.types.long;
const LONG = ref.types.long;
const LPARAM = ref.types.int32;
const UINT = ref.types.uint;

const COLORREF = DWORD;

module.exports = {
  BOOL,
  BYTE,
  COLORREF,
  DWORD,
  HWND,
  LONG,
  LPARAM,
  UINT,

  ptr: {
    byte: ref.refType(ref.types.byte),
    string: ref.refType(ref.types.CString),
    ulong: ref.refType(ref.types.ulong),
    void: ref.refType(ref.types.void),

    BYTE: ref.refType(BYTE),
    COLORREF: ref.refType(COLORREF),
    DWORD: ref.refType(DWORD),
  },
};