# win-opacity

Read and write the opacity values of windows on the Windows operating system. **Not yet on npm, release coming soon**

## Example

```js
const winOpacity = require('win-opacity');
const windows = winOpacity.getWindows();
for (const win of windows) {
  console.log(win.title); // Title on the window
  const opacity = winOpacity.getOpacity(win);
  // Make the window slightly more transparent
  winOpacity.setOpacity(win, opacity - 10);
}
```