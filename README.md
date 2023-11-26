## CLI

1. writer `config.json` at anywhere, [example](config.example.json)
2. just start `win-opacity` in terminal where's config.json at.
   1. if config.json not found in current path, will use default config in installation path.
3. app will keep runing, change specified-window's opacity.

```
yarn global add https://github.com/Weidows-projects/win-opacity
```

```
└ $ win-opacity
Current config:  config.json
Example config:  D:\Scoop\persist\nvm\yarn\global\node_modules\win-opacity\config.example.json


└ $ win-opacity list
180 { title: 'win-opacity-js - Visual Studio Code', handle: 67630 }
255 {
  title: 'C:\\WINDOWS\\system32\\cmd.exe - D:\\Repos\\Weidows-projects\\Keeper\\utils.bat',
  handle: 196680
}
255 { title: 'Windows 输入体验', handle: 132566 }
```

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

## Type Definitions

Definitions given in TypeScript format.

```typescript
type WindowHandle = number;
interface NativeWindow {
  string title;
  WindowHandle handle;
};
```

## API

- `getWindows() -> NativeWindow[]`
  - Gets all visible windows
- `getOpacity(window: WindowHandle | NativeWindow) -> number`
  - Returns the opacity of a window. The value will be in the range of [0-255]
- `setOpacity(window: WindowHandle | NativeWindow, opacity: number) -> void`
  - Sets the opacity of a window. `opacity` must be in the range of [0-255]

> [GitHub - MCluck90/auto-win-opacity: Automatically apply different opacity levels to windows on Windows](https://github.com/MCluck90/auto-win-opacity)
