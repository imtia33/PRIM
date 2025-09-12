import { Tabs } from "expo-router"
import { View, useWindowDimensions } from "react-native"
import React from "react"
import { useTheme } from "../../../context/ColorMode"
import NestedTabSidebar from "../../../componants/NestedTabSidebar"
import { Home, User, Star, GitPullRequest, Settings, Search, Compass, FileText } from 'lucide-react-native'

export default function PRLayout() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  const { theme } = useTheme()

  // Tab configuration for PR section
  const prTabConfig = [
    {
      name: 'prs',
      title: 'My Prs',
      icon: 'git-pull-request',
    },
    {
      name: 'profile',
      title: 'Profile', 
      icon: 'user',
    },
    {
      name: 'createShowOffs',
      title: 'Showcase',
      icon: 'star',
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
            title="Pull Requests"
            subtitle="Review & Merge"
            accentColor={theme.mode === "dark" ? '#d6a4ff' : '#9c5de0'}
            tabConfig={prTabConfig}
          />
        )}
      >
        <Tabs.Screen
          name="prs"
          options={{
            title: "My Prs",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
        
      </Tabs>
    </View>
  )
}