"use client"
import { View, Text, TouchableOpacity, Animated, useWindowDimensions, Platform, TouchableNativeFeedback } from "react-native"
import React, { useRef, useState, useContext, useEffect } from "react"
import { TabBarContext } from "../context/TabBarContext"
import { useTheme } from "../context/ColorMode"
import ThemeChanger from "./ThemeChanger"
import { Home, User, Star, Compass, Search, Code, Settings, GitBranch, Eye, Users, GitPullRequest } from 'lucide-react-native'

function NestedTabSidebar({ 
  state, 
  descriptors, 
  navigation, 
  title = "MySpace",
  subtitle = "Commit & Collaborate",
  accentColor = null, // Will use theme.accent if not provided
  tabConfig = [] // Array of { name, title, icon, iconType }
}) {
  const { theme, toggleTheme } = useTheme()
  const actualAccentColor = accentColor || theme.accent
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768
  const { showTabBar, setShowTabBar } = useContext(TabBarContext)
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Only keep sidebar open/close animation
  const desktopWidth = 200; // Fixed width for desktop
  const mobileWidth = width * 0.85;
  
  const widthAnim = useRef(new Animated.Value(showTabBar ? (isDesktop ? desktopWidth : mobileWidth) : 0)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: showTabBar ? (isDesktop ? desktopWidth : mobileWidth) : 0,
      duration: 300, // Smoother animation
      useNativeDriver: false,
    }).start()
  }, [showTabBar, isDesktop, width])

  const borderColor = theme.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
  const shadowColor = theme.mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"

  // Helper function to get icon based on tab config
  const getIcon = (routeName, color, size = 20) => {
    const tabConfigItem = tabConfig.find(config => config.name === routeName);
    
    if (tabConfigItem) {
      const { icon } = tabConfigItem;
      
      // Map icon names to Lucide icons
      switch (icon) {
        case 'home':
          return <Home size={size} color={color} />;
        case 'user':
          return <User size={size} color={color} />;
        case 'star':
          return <Star size={size} color={color} />;
        case 'compass':
          return <Compass size={size} color={color} />;
        case 'search':
          return <Search size={size} color={color} />;
        case 'settings':
          return <Settings size={size} color={color} />;
        case 'git-pull-request':
          return <GitPullRequest size={size} color={color} />;
        default:
          return <Code size={size} color={color} />;
      }
    }
    
    // Fallback to default icons
    switch (routeName) {
      case 'prs':
        return <GitPullRequest size={size} color={color} />;
      case 'browse':
        return <Compass size={size} color={color} />;
      case 'createShowOffs':
        return <Star size={size} color={color} />
      case 'profile':
        return <User size={size} color={color} />;
      case 'settings':
        return <Settings size={size} color={color} />;
      default:
        return <Code size={size} color={color} />;
    }
  };

  return (
    <Animated.View
      style={{
        width: widthAnim,
        height: "100%",
        backgroundColor: theme.mode === "dark" 
          ? 'rgba(18, 20, 25, 0.8)' 
          : 'rgba(245, 247, 250, 0.9)',
        borderTopLeftRadius:  24,
        ...(!isDesktop && {
          borderBottomLeftRadius: 24,
        }),
        
        shadowColor: shadowColor,
        shadowOffset: {
          width: 4,
          height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        position: "static",
        overflow: "hidden",
      }}
    >
      {/* Elegant Header with gradient accent */}
      <View 
        style={{ 
          paddingHorizontal: 24, 
          paddingVertical: 32,
          marginBottom: 16,
          position: 'relative',
        }}
      >
        {/* Subtle gradient accent line */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 24,
            right: 24,
            height: 3,
            borderRadius: 2,
            backgroundColor: actualAccentColor,
          }}
        />
        
        <View style={{ alignItems: 'center' }}>
          
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: theme.mode === "dark" ? 'rgba(115, 210, 190, 0.15)' : 'rgba(115, 210, 190, 0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.mode === "dark" ? 'rgba(115, 210, 190, 0.35)' : 'rgba(115, 210, 190, 0.25)',
            }}
          >
            <Settings 
              size={26} 
              color={theme.mode === "dark" ? '#8ae5d3' : '#52b6a4'} 
            />
          </View>
          
          {/* Enhanced typography */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: -0.5,
              textAlign: 'center',
              lineHeight: 28,
            }}
          >
            <Text style={{ color: theme.mode === "dark" ? '#ffffff' : '#333333' }}>{title.split(' ')[0]}</Text>
            <Text style={{ color: theme.mode === "dark" ? '#8ae5d3' : '#52b6a4' }}>{title.split(' ').slice(1).join(' ')}</Text>
          </Text>
          
          {/* Subtle subtitle */}
          <Text
            style={{
              fontSize: 13,
              color: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: '500',
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {subtitle.split('&').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <Text style={{ color: actualAccentColor }}>&</Text>
                )}
              </React.Fragment>
            ))}
          </Text>
        </View>
        <View style={{
          height: 1,
          backgroundColor: borderColor,
          width: isDesktop ? '100%' : '110%',
          alignSelf: 'center',
          marginTop: 16,
        }}/>
      </View>

      {/* Navigation Section */}
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 12,
            marginLeft: 8,
            paddingLeft: 4,
          }}
        >
          Navigation
        </Text>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isActive = isDesktop && state.index === index;
          const isAndroid = Platform.OS === "android";

          const onPress = () => {
            setShowTabBar(false);
            navigation.navigate(route.name);
          }

          const hoverProps = isDesktop ? {
            onMouseEnter: () => setHoveredIndex(index),
            onMouseLeave: () => setHoveredIndex(null),
          } : {};

          const Touchable = isAndroid ? TouchableNativeFeedback : TouchableOpacity;
          const touchableProps = isAndroid ? {
            background: TouchableNativeFeedback.Ripple(
              theme.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
              false
            ),
          } : {
            activeOpacity: 0.7,
            ...hoverProps,
          };

          // Enhanced styling with better visual hierarchy
          let backgroundColor = 'transparent';
          let color = theme.text;
          let fontWeight = '300';
          
          let paddingVertical = 8; // Thinner height
          let borderRadius = 10;
          let borderWidth = 0;
          let borderColorTab = 'transparent';
  
          // --- Focused tab styling logic ---
          if (isDesktop) {
            if (isActive) {
              backgroundColor = theme.mode === 'dark' 
                ? 'rgba(115, 210, 190, 0.18)'
                : 'rgba(115, 210, 190, 0.15)';
              
              color = theme.mode === 'dark' ? '#8ae5d3' : '#52b6a4';
              fontWeight = '500';
              borderRadius = 10;
              borderWidth = 1;
              borderColorTab = theme.mode === 'dark' ? 'rgba(115, 210, 190, 0.35)' : 'rgba(115, 210, 190, 0.25)'; 
              paddingVertical = 10;
            } else if (hoveredIndex === index) {
              backgroundColor = theme.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.05)';
              color = theme.mode === 'dark' ? '#8ae5d3' : '#52b6a4';
              fontWeight = '400';
            }
          }

          return (
            <View 
              key={route.key} 
              style={{ 
                borderRadius: borderRadius, 
                overflow: 'hidden', 
                marginBottom: 4,
              }}
            >
              <Touchable {...touchableProps} onPress={onPress}>
                <View
                  style={{
                    paddingVertical: paddingVertical,
                    paddingHorizontal: 16,
                    backgroundColor,
                    borderRadius: borderRadius,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minHeight: 42,
                  }}
                >
                  {/* Icon with improved container */}
                  <View style={{
                    marginRight: 16,
                    width: 30, 
                    height: 30, 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)', 
                    borderRadius: 8, 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getIcon(route.name, color, 18)}
                  </View>
                  
                  {/* Enhanced text styling */}
                  <Text
                    style={{
                      color: isActive 
                        ? (theme.mode==='dark'?'#fff':'#000')
                        : (theme.mode==='dark'?'rgba(255, 255, 255, 0.8)':'rgba(0, 0, 0, 0.75)'),
                      fontSize: isDesktop?14:15,
                      fontWeight: isActive ? '500' : '400',
                      letterSpacing: 0.2,
                      textTransform: 'capitalize',
                      flex: 1,
                    }}
                  >
                    {label}
                  </Text>

                  {/* Active indicator dot */}
                  {isActive && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.mode === 'dark' ? '#8ae5d3' : '#52b6a4',
                        marginLeft: 8,
                      }}
                    />
                  )}
                </View>
              </Touchable>
            </View>
          )
        })}
      </View>

      {!isDesktop && (
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.mode === 'dark' ? '#ffffff' : '#333333',
                  marginBottom: 2,
                }}
              >
                Appearance
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.6)',
                }}
              >
                {theme.mode === 'dark' ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
            <ThemeChanger
              focused={theme.mode}
              onToggle={toggleTheme}
            />
          </View>
        </View>
      )}
    </Animated.View>
  )
}

export default NestedTabSidebar