// TabBarContext.js
import { createContext } from 'react'

export const TabBarContext = createContext({
  showTabBar: true,
  setShowTabBar: () => {},
})
