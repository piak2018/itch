import { Watcher } from "common/util/watcher";

import preboot from "main/reactors/preboot";
import preferences from "main/reactors/preferences";
import winds from "main/reactors/winds";
import locales from "main/reactors/locales";
import tray from "main/reactors/tray";
import menu from "main/reactors/menu";
import installLocations from "main/reactors/install-locations";
import selfUpdate from "main/reactors/self-update";
import setup from "main/reactors/setup";
import tabs from "main/reactors/tabs";
import triggers from "main/reactors/triggers";
import modals from "main/reactors/modals";
import openAtLogin from "main/reactors/open-at-login";
import proxy from "main/reactors/proxy";
import login from "main/reactors/login";
import dialogs from "main/reactors/dialogs";
import i18n from "main/reactors/i18n";
import contextMenu from "main/reactors/context-menu";
import profile from "main/reactors/profile";
import navigation from "main/reactors/navigation";
import tabSave from "main/reactors/tab-save";
import commons from "main/reactors/commons";
import purchases from "main/reactors/purchases";
import url from "main/reactors/url";
import tasks from "main/reactors/tasks";
import downloads from "main/reactors/downloads";
import queueLaunch from "main/reactors/queue-launch";
import updater from "main/reactors/updater";
import gameUpdates from "main/reactors/game-updates";
import webContents from "main/reactors/web-contents";
import notifications from "main/reactors/notifications";
import clipboard from "main/reactors/clipboard";

import { Logger } from "common/logger";
import { currentRuntime } from "common/os/runtime";
const runtime = currentRuntime();

export default function getWatcher(logger: Logger) {
  const watcher = new Watcher(logger);

  preboot(watcher);
  preferences(watcher);
  winds(watcher);
  locales(watcher);
  tray(watcher);
  menu(watcher, runtime);
  installLocations(watcher);
  selfUpdate(watcher);
  setup(watcher);
  tabs(watcher);
  triggers(watcher);
  modals(watcher);
  openAtLogin(watcher);
  proxy(watcher);
  login(watcher);
  dialogs(watcher);
  i18n(watcher);
  contextMenu(watcher);
  profile(watcher);
  navigation(watcher);
  tabSave(watcher);
  commons(watcher);
  purchases(watcher);
  url(watcher);
  tasks(watcher);
  downloads(watcher);
  queueLaunch(watcher);
  updater(watcher);
  gameUpdates(watcher);
  webContents(watcher);
  notifications(watcher);
  clipboard(watcher);

  watcher.validate();
  return watcher;
}
