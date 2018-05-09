/**
 * Native calls to access and modify windows
 * 
 * Courtesy of https://github.com/SkaceKamen/vscode-win-opacity
 */

const ref = require('ref');
const ffi = require('ffi');

const bytePtr = ref.refType(ref.types.byte);
const voidPtr = ref.refType(ref.types['void']);
const stringPtr = ref.refType(ref.types.CString);
const ulongPtr = ref.refType(ref.types.ulong);

const GWL_EXSTYLE = -20;
const WS_EX_LAYERED = 0x80000;
const LWA_ALPHA = 0x2;
const WS_EX_TOOLWINDOW = 0x00000080;

// Load all of the user32 functions we need
// Note: The A suffix indicates we're using ASCII for texts
const user32 = ffi.Library('user32', {
	EnumWindows: ['bool', [voidPtr, 'int32']],
	GetWindowTextA: ['long', ['long', stringPtr, 'long']],
	GetWindowLongA: ['long', ['long', 'int32']],
	SetWindowLongA: ['uint32', ['long', 'int32', 'long']],
	SetLayeredWindowAttributes: ['bool', ['long', 'uint32', 'byte', 'uint32']],
	GetLayeredWindowAttributes: ['bool', ['long', ulongPtr, bytePtr, ulongPtr]],
	IsWindowVisible: ['bool', ['long']]
});

// Ignore certain system processes
const ignoredWindows = [
	'Microsoft Store',
	'Photos',
	'Program Manager',
	'Settings',
	'Team Foundation Build Notification'
];

let _windows = []
const getWindows = ffi.Callback('bool', ['long', 'int32'], function(hwnd) {
	if (!user32.IsWindowVisible(hwnd)) {
		return true;
	}
	// Load window title
	const buffer = new Buffer(255);
	user32.GetWindowTextA(hwnd, buffer, 255);
	const windowName = ref.readCString(buffer, 0).trim();

	if (!windowName || ignoredWindows.includes(windowName)) {
		return true;
	}

	_windows.push({
		title: windowName,
		handle: hwnd
	});
	return true;
});

exports.getWindows = function() {
	_windows = [];
	user32.EnumWindows(getWindows, 0);
	return _windows;
};

exports.setOpacity = function(handle, opacity) {
	if (handle.title && handle.handle) {
		handle = handle.handle;
	}

	if (typeof opacity !== 'number' || opacity < 0 || opacity > 255) {
		throw new Error('Must provide an opacity value between 0 and 255');
	}

	opacity = opacity | 0;

	const windowLong = user32.GetWindowLongA(handle, GWL_EXSTYLE);
	user32.SetWindowLongA(handle, GWL_EXSTYLE, windowLong | WS_EX_LAYERED);
	return user32.SetLayeredWindowAttributes(handle, 0, opacity, LWA_ALPHA);
};

exports.getOpacity = function(handle) {
	if (handle.title && handle.handle) {
		handle = handle.handle;
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