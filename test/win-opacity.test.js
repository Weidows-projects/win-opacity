const winOpacity = require('../');
const assert = require('assert');

describe('WinOpacity', function() {
  describe('interface', function() {
    it('should contain a getWindows function', function() {
      assert.ok(winOpacity.getWindows, 'Expected a getWindows function to exist');
    });
    it('should contain a getOpacity function', function() {
      assert.ok(winOpacity.getOpacity, 'Expected a getOpacity function to exist');
    });
    it('should contain a setOpacity function', function() {
      assert.ok(winOpacity.setOpacity, 'Expected a setOpacity function to exist');
    });
  });

  describe('getWindows', function() {
    it('should return an array', function() {
      assert(Array.isArray(winOpacity.getWindows()));
    });
    it('should return windows with a title and handle', function() {
      const windows = winOpacity.getWindows();
      const window = windows[0];
      assert.ok(window.title, 'Windows should have a non-empty title');
      assert.ok(window.handle, 'Windows should provide a handle');
    });
  });

  describe('getOpacity', function() {
    it('should return a number', function() {
      const window = winOpacity.getWindows()[0];
      assert(typeof winOpacity.getOpacity(window) === 'number');
    });
    it('should accept a NativeWindow or WindowHandle', function() {
      const window = winOpacity.getWindows()[0];
      const handle = window.handle;
      const nativeOpacity = winOpacity.getOpacity(window);
      const handleOpacity = winOpacity.getOpacity(handle);
      assert(nativeOpacity === handleOpacity, 'Expected to get the same opacity value');
    });
  });

  describe('setOpacity', function() {
    it('should only accept a window or window handle', function() {
      assert.throws(function() {
        winOpacity.setOpacity(null);
      }, 'Should throw when passing null');
      assert.throws(function() {
        winOpacity.setOpacity('');
      }, 'Should throw when passing a string');

      const window = winOpacity.getWindows()[0];
      const opacity = winOpacity.getOpacity(window);
      assert.doesNotThrow(function() {
        winOpacity.setOpacity(window, opacity);
      }, 'Should not throw when passed a window object');
      assert.doesNotThrow(function() {
        winOpacity.setOpacity(window.handle, opacity);
      }, 'Should not throw when passed a window handle');
    });
  });
});