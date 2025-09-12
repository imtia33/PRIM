import { Tabs } from "expo-router"
import { View, useWindowDimensions } from "react-native"
import React from "react"
import { useTheme } from "../../../context/ColorMode"
import NestedTabSidebar from "../../../componants/NestedTabSidebar"
import { Home, User, Star, GitPullRequest, Settings, Search, Compass, Cog, Globe, FileText } from 'lucide-react-native'

export default function SettingsLayout() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  const { theme } = useTheme()

  // Tab configuration for Settings
  const settingsTabConfig = [
    {
      name: 'browse',
      title: 'Browse',
      icon: 'compass',
    },
    {
      name: 'search',
      title: 'Search',
      icon: 'search',
    }
  ]

  return (
    <View 
      style={{ 
        flex: 1, 
        flexDirection: "row", 
        backgroundColor: theme.firstTabBackground,
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: "left",
        }}
        tabBar={(props) => (
          <NestedTabSidebar 
            {...props} 
            title="Settings"
            subtitle="Configure & Customize"
            accentColor={theme.mode === "dark" ? '#8ae5d3' : '#52b6a4'}
            tabConfig={settingsTabConfig}
          />
        )}
      >
        <Tabs.Screen
          name="browse"
          options={{
            title: "Browse",
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
          }}
        />
      </Tabs>
    </View>
  )
}