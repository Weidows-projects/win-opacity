const ffi = require('ffi');
const ref = require('ref');
const user32 = require('./user32');
const t = require('./types');

// C Constants
const GA_ROOTOWNER = 3;
const GWL_EXSTYLE = -20;
const LWA_ALPHA = 0x2;
const STATE_SYSTEM_INVISIBLE = 0x00008000;
const WS_EX_LAYERED = 0x80000;
const WS_EX_TOOLWINDOW = 0x00000080;
const WS_EX_APPWINDOW = 0x00040000;

const isAltTabWindow = (handle) => {
	if (handle.handle) {
		handle = handle.handle;
	}

	if (!user32.IsWindowVisible(handle)) {
		return false;
	}

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

let _windows = [];
const getWindows = ffi.Callback('bool', ['long', 'int32'], function(hwnd) {
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