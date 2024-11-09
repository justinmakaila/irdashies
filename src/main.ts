import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import path from 'path';
import { iRacingSDKSetup } from './bridge/setup';
import {
  createDefaultDashboardIfNotExists,
  getDashboard,
  updateDashboardWidget,
  type DashboardWidget,
} from './storage/dashboards';

// @ts-expect-error no types for squirrel
import started from 'electron-squirrel-startup';

// used for Hot Module Replacement
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

const createWidget = ({ id, layout }: DashboardWidget): BrowserWindow => {
  const { x, y, width, height } = layout;
  const title = id.charAt(0).toUpperCase() + id.slice(1);

  // Create the browser window.
  const browserWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    title: `iRacing Dashies - ${title}`,
    transparent: true,
    frame: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  browserWindow.setAlwaysOnTop(true, 'floating', 1);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/${id}`);
  } else {
    browserWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: `/${id}` }
    );
  }

  return browserWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const defaultDashboard = getDashboard('default');
  if (!defaultDashboard) {
    throw new Error('Default dashboard not found');
  }

  for (const widget of defaultDashboard.widgets) {
    const browserWindow = createWidget(widget);
    trackWindowMovement(widget, browserWindow);
  }

  setupTaskBar();
});

app.on('window-all-closed', () => app.quit());

function trackWindowMovement(
  widget: DashboardWidget,
  browserWindow: BrowserWindow
) {
  browserWindow.on('moved', () => {
    const [x, y] = browserWindow.getPosition();
    widget.layout.x = x;
    widget.layout.y = y;

    updateDashboardWidget(widget, 'default');
  });
}

function setupTaskBar() {
  // TODO: Add icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAH5JREFUSEvtlUEOgCAMBJdvGfXz6rs0JuIB0zjZpFyUaxeWadlQlLxK8vnqbrBJGgKqVdJ01ajuQbC/tKwSU91vEDb0fjztK6K9pTp7BoukMbj/WZtrzSXA+exuQNHtoFF0e8jpBhTdJqAbqc7OwYcNaA6orv+XSXOAdemf/gFmjSgZ2hbq7gAAAABJRU5ErkJggg=='
  );
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click() {
        console.log('Open settings');
      },
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('irDashies');
  tray.setContextMenu(contextMenu);
}

createDefaultDashboardIfNotExists();
iRacingSDKSetup();
