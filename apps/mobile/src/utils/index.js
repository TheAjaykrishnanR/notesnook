import { createRef } from 'react';
import { Dimensions, NativeModules, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import { beginBackgroundTask, endBackgroundTask } from 'react-native-begin-background-task';
import RNTooltips from 'react-native-tooltips';
import { useSettingStore } from '../provider/stores';
import { eSendEvent } from '../services/EventManager';
import Navigation from '../services/Navigation';
import * as ackeeTracker from './ackee';
import { db } from './database';
import { refreshNotesPage } from './Events';
import { MMKV } from './mmkv';
import { tabBarRef } from './Refs';

export const Tracker = ackeeTracker.create('https://sa.streetwriters.co', {
  ignoreLocalhost: true
});

export const STORE_LINK =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/us/app/notesnook/id1544027013'
    : 'https://play.google.com/store/apps/details?id=com.streetwriters.notesnook';

const imgNames = [
  'favorites',
  'notes',
  'notebooks',
  'tags',
  'trash',
  'login',
  'welcome',
  'vault',
  'accent',
  'settings',
  'backup',
  'community',
  'export',
  'organize',
  'privacy',
  'sync',
  'richtext'
];

export const updateList = items => {
  eSendEvent('onListUpdate', items);
};

export const InteractionManager = {
  runAfterInteractions: (func, time = 300) => setTimeout(func, time)
};

export async function setSetting(settings, name, value) {
  let s = { ...settings };
  s[name] = value;
  await MMKV.setStringAsync('appSettings', JSON.stringify(s));
  useSettingStore.getState().setSettings(s);
}

export const scrollRef = createRef();
export const AndroidModule = NativeModules.NNativeModule;

export const getElevation = elevation => {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: { width: 0.3 * elevation, height: 0.5 * elevation },
    shadowOpacity: 0.2,
    shadowRadius: 0.7 * elevation
  };
};

export const sortSettings = {
  sort: 'default',
  /**
   * @type {"desc" | "asc"}
   */
  sortOrder: 'desc'
};

export const GROUP = {
  default: 'default',
  abc: 'abc',
  year: 'year',
  week: 'week',
  month: 'month'
};

export const SORT = {
  dateEdited: 'Date edited',
  dateCreated: 'Date created'
  //title:"Title",
};

export const editing = {
  currentlyEditing: false,
  isFullscreen: false,
  actionAfterFirstSave: {
    type: null
  },
  isFocused: false,
  focusType: null,
  movedAway: true,
  tooltip: false,
  isRestoringState: false
};
export const selection = {
  data: [],
  type: null,
  selectedItems: []
};

export const history = {
  selectedItemsList: [],
  selectionMode: false
};

export const bgTaskOptions = {
  taskName: 'notesnookSync',
  taskTitle: 'Notesnook Sync',
  taskDesc: 'Syncing your notes.',
  taskIcon: {
    name: 'ic_stat_name',
    type: 'drawable'
  },
  color: '#ffffff',
  linkingURI: 'com.streetwriters.notesnook://launch'
};

export async function doInBackground(cb) {
  if (Platform.OS === 'ios') {
    let bgTaskId;
    try {
      bgTaskId = await beginBackgroundTask();
      let res = await cb();
      await endBackgroundTask(bgTaskId);
      return res;
    } catch (e) {
      return e.message;
    }
  } else {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res, rej) => {
      try {
        await BackgroundService.start(async () => {
          let result = await cb();
          await BackgroundService.stop();
          res(result);
        }, bgTaskOptions);
      } catch (e) {
        res(e.message);
      }
    });
  }
}

export let dWidth = Dimensions.get('window').width;
export let dHeight = Dimensions.get('window').height;

export function setWidthHeight(size) {
  dWidth = size.width;
  dHeight = size.height;
}

export function getTotalNotes(notebook) {
  if (notebook.type === 'topic') {
    return notebook.notes.length;
  }
  if (!notebook.topics) return 0;
  return notebook.topics.reduce((sum, topic) => {
    return sum + topic.notes.length;
  }, 0);
}

export const itemSkus = [
  'com.streetwriters.notesnook.sub.mo',
  'com.streetwriters.notesnook.sub.yr',
  'com.streetwriters.notesnook.sub.yr.15',
  'com.streetwriters.notesnook.sub.mo.15',
  'com.streetwriters.notesnook.sub.mo.ofr',
  'com.streetwriters.notesnook.sub.yr.trialoffer',
  'com.streetwriters.notesnook.sub.mo.trialoffer'
];

export const MenuItemsList = [
  {
    name: 'Notes',
    icon: 'home-variant-outline',
    close: true
  },
  {
    name: 'Notebooks',
    icon: 'book-outline',
    close: true
  },
  {
    name: 'Favorites',
    icon: 'star-outline',
    close: true
  },
  {
    name: 'Tags',
    icon: 'pound',
    close: true
  },
  {
    name: 'Monographs',
    icon: 'text-box-multiple-outline',
    close: true,
    func: () => {
      let params = {
        type: 'notes',
        menu: true,
        get: 'monographs',
        title: 'Monographs',
        id: 'monographs_navigation'
      };

      eSendEvent(refreshNotesPage, params);
      Navigation.navigate('NotesPage', params, {
        heading: 'Monographs',
        id: 'monographs_navigation',
        type: 'notes'
      });
    }
  },
  {
    name: 'Trash',
    icon: 'delete-outline',
    close: true
  }
];

export const SUBSCRIPTION_STATUS = {
  BASIC: 0,
  TRIAL: 1,
  BETA: 2,
  PREMIUM: 5,
  PREMIUM_EXPIRED: 6,
  PREMIUM_CANCELLED: 7
};

export const SUBSCRIPTION_STATUS_STRINGS = {
  0: 'Basic',
  1: 'Trial',
  2: Platform.OS === 'ios' ? 'Pro' : 'Beta',
  5: 'Pro',
  6: 'Expired',
  7: 'Pro'
};

export const SUBSCRIPTION_PROVIDER = {
  0: null,
  1: {
    type: 'iOS',
    title: 'Subscribed on iOS',
    desc: 'You subscribed to Notesnook Pro on iOS using Apple In App Purchase. You can cancel anytime with your iTunes Account settings.',
    icon: 'ios'
  },
  2: {
    type: 'Android',
    title: 'Subscribed on Android',
    desc: 'You subscribed to Notesnook Pro on Android Phone/Tablet using Google In App Purchase.',
    icon: 'android'
  },
  3: {
    type: 'Web',
    title: 'Subscribed on Web',
    desc: 'You subscribed to Notesnook Pro on the Web/Desktop App.',
    icon: 'web'
  }
};

export const BUTTON_TYPES = {
  transparent: {
    primary: 'transparent',
    text: 'accent',
    selected: 'nav'
  },
  gray: {
    primary: 'transparent',
    text: 'icon',
    selected: 'transGray'
  },
  grayBg: {
    primary: 'nav',
    text: 'icon',
    selected: 'nav'
  },
  grayAccent: {
    primary: 'nav',
    text: 'accent',
    selected: 'nav'
  },
  accent: (themeColor, text) => ({
    primary: themeColor,
    text: text,
    selected: themeColor
  }),
  inverted: {
    primary: 'bg',
    text: 'accent',
    selected: 'bg'
  },
  white: {
    primary: 'transparent',
    text: 'light',
    selected: 'transGray'
  },
  shade: {
    primary: 'shade',
    text: 'accent',
    selected: 'accent',
    opacity: 0.12
  },
  error: {
    primary: 'red',
    text: 'red',
    selected: 'red',
    opacity: 0.12
  },
  errorShade: {
    primary: 'transparent',
    text: 'red',
    selected: 'red',
    opacity: 0.12
  },
  warn: {
    primary: 'warningBg',
    text: 'warningText',
    selected: 'warningBg',
    opacity: 0.12
  }
};

let htmlToText;
export async function toTXT(note) {
  let text;
  if (note.locked) {
    text = note.content.data;
  } else {
    text = await db.notes.note(note.id).content();
  }
  htmlToText = htmlToText || require('html-to-text');
  text = htmlToText.convert(text, {
    selectors: [{ selector: 'img', format: 'skip' }]
  });
  text = `${note.title}\n \n ${text}`;
  return text;
}

export const TOOLTIP_POSITIONS = {
  LEFT: 1,
  RIGHT: 2,
  TOP: 3,
  BOTTOM: 4
};
let prevTarget = null;
export function showTooltip(event, text, position) {
  if (!event._targetInst?.ref?.current) return;
  prevTarget && RNTooltips.Dismiss(prevTarget);
  prevTarget = null;
  prevTarget = event._targetInst.ref.current;
  RNTooltips.Show(event._targetInst.ref.current, tabBarRef.current, {
    text: text,
    tintColor: 'black',
    corner: 40,
    textSize: 14,
    position: position,
    duration: 1000
  });
}

let appIsInitialized = false;

export function setAppIsInitialized(value) {
  appIsInitialized = value;
}

export function getAppIsIntialized() {
  return appIsInitialized;
}

let intentOnAppLoadProcessed = false;

export function setIntentOnAppLoadProcessed(value) {
  intentOnAppLoadProcessed = value;
}

export function getIntentOnAppLoadProcessed() {
  return intentOnAppLoadProcessed;
}
