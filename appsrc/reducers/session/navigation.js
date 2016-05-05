
import {handleActions} from 'redux-actions'
import {map, reject, omit, object, pick, indexBy} from 'underline'
import invariant from 'invariant'
import uuid from 'node-uuid'

import SearchExamples from '../../constants/search-examples'
import staticTabData from '../../constants/static-tab-data'

import {filter} from 'underline'

const perish = process.env.PERISH === '1' ? console.log.bind(console) : () => 0

const baseTabs = ['featured', 'library']

const initialState = {
  page: 'gate',
  tabs: {
    constant: baseTabs,
    transient: []
  },
  tabData: staticTabData::pick(...baseTabs)::indexBy('id'),
  id: 'featured',
  shortcutsShown: false
}

export default handleActions({
  SHORTCUTS_VISIBILITY_CHANGED: (state, action) => {
    const {visible} = action.payload
    return {...state, shortcutsShown: visible}
  },

  SWITCH_PAGE: (state, action) => {
    const page = action.payload
    return {...state, page}
  },

  NAVIGATE: (state, action) => {
    const {id, data} = action.payload
    invariant(typeof id === 'string', 'id must be a string')
    invariant(typeof data === 'object', 'data must be an object')

    const {tabData} = state
    const {tabs} = state
    const {constant, transient} = tabs

    const tabsByPath = tabData::map((x, id) => [x.path, id])::object()

    if (tabData[id]) {
      // switching to an existing tab, by id
      return {...state, id}
    } else if (tabsByPath[id]) {
      // switching to an existing tab, by path (don't open same game twice, etc.)
      const idForPath = tabsByPath[id]
      return {...state, id: idForPath}
    } else {
      // open a new tab
      // static tabs don't get UUIDs
      const newTab = staticTabData[id] ? id : uuid.v4()

      const newTabs = {
        constant,
        transient: [
          ...transient,
          newTab
        ]
      }

      const newTabData = {
        ...tabData,
        [newTab]: {
          ...staticTabData[id],
          ...tabData[id],
          path: id,
          ...data
        }
      }

      return {...state, id: newTab, tabs: newTabs, tabData: newTabData}
    }
  },

  MOVE_TAB: (state, action) => {
    const {before, after} = action.payload
    invariant(typeof before === 'number', 'old tab index is a number')
    invariant(typeof after === 'number', 'new tab index is a number')

    const {tabs} = state
    const {transient} = tabs

    const newTransient = transient::map((t, i) => {
      switch (i) {
        case before:
          return transient[after]
        case after:
          return transient[before]
        default:
          return t
      }
    })

    return {
      ...state,
      tabs: {
        ...tabs,
        transient: newTransient
      }
    }
  },

  CLOSE_TAB: (state, action) => {
    const {id, tabs, tabData} = state
    const closeId = action.payload || id
    const {constant, transient} = tabs

    const ids = constant.concat(transient)
    const index = ids.indexOf(id)

    const newTransient = transient::reject((x) => x === closeId)
    const newTabData = tabData::omit(closeId)

    const newIds = constant.concat(newTransient)
    const numNewIds = newIds.length

    const nextIndex = Math.min(index, numNewIds - 1)
    const newId = newIds[nextIndex]

    return {
      ...state,
      id: newId,
      tabs: {
        constant,
        transient: newTransient
      },
      tabData: newTabData
    }
  },

  SEARCH_FETCHED: (state, action) => {
    const {results} = action.payload
    const searchExampleIndex = Math.floor(Math.random() * (SearchExamples.length - 1))
    return {...state, searchResults: results, searchOpen: true, searchExample: SearchExamples[searchExampleIndex]}
  },

  TAB_DATA_FETCHED: (state, action) => {
    const {id, timestamp, data} = action.payload
    if (!timestamp) {
      perish('Ignoring non-timestamped tabData: ', id, data)
      return state
    }

    const {tabData} = state
    const oldData = tabData[id]
    if (oldData && oldData.timestamp && oldData.timestamp > timestamp) {
      perish('Ignoring stale tabData: ', id, data)
      return state
    }

    const newTabData = {
      ...tabData,
      [id]: {
        ...tabData[id],
        ...data
      }
    }

    return {...state, tabData: newTabData}
  },

  TAB_EVOLVED: (state, action) => {
    const {id, data} = action.payload
    invariant(typeof id === 'string', 'id must be a string')

    const {tabData} = state
    const newTabData = {
      ...tabData,
      [id]: {
        ...tabData[id],
        ...data
      }
    }

    return {
      ...state,
      tabData: newTabData
    }
  },

  TABS_RESTORED: (state, action) => {
    const snapshot = action.payload
    invariant(typeof snapshot === 'object', 'tab snapshot must be an object')

    const {id} = state
    const tabData = []
    const transient = snapshot.items::map((tab) => {
      if (typeof tab !== 'object' || !tab.id || !tab.path) {
        return
      }

      tabData[tab.id] = {
        path: tab.path
      }
      return tab.id
    })::filter((x) => !!x)

    return {
      ...state,
      id,
      tabs: {
        ...state.tabs,
        transient
      },
      tabData: {
        ...state.tabData,
        ...tabData
      }
    }
  },

  LOGOUT: (state, action) => {
    return initialState
  },

  // happens after SESSION_READY depending on the user's profile (press, developer)
  UNLOCK_TAB: (state, action) => {
    const {path} = action.payload
    invariant(typeof path === 'string', 'unlocked tab path must be a string')

    const {constant} = state.tabs

    return {
      ...state,
      tabs: {
        ...state.tabs,
        constant: [
          ...constant,
          path
        ]
      },
      tabData: {
        ...state.tabData,
        [path]: {
          ...state.tabData[path],
          ...staticTabData[path]
        }
      }
    }
  },

  CLOSE_SEARCH: (state, action) => {
    return {...state, searchResults: null, searchOpen: false}
  }
}, initialState)
