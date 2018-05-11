const winOpacity = require('../');
const assert = require('assert');

describe('win-opacity', function() {
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

  describe('invisible windows', function() {
    it('should be able to make a window invisible', function() {
      // Setup
      // Get the first non-invisible window
      const window = winOpacity.getWindows()
        .find(w => winOpacity.getOpacity(w) > 0);
      const startingOpacity = winOpacity.getOpacity(window);
      
      // Gather result
      winOpacity.setOpacity(window, 0);
      const actual = winOpacity.getOpacity(window);

      // Revert state
      winOpacity.setOpacity(window, startingOpacity);

      // Set expectations
      assert.equal(actual, 0, 'An invisible window must return an opacity of 0');
    });
  });
});