"use client"

import { router, Tabs } from "expo-router"
import { View, Text, Platform, Animated, Easing, useWindowDimensions } from "react-native"
import { TouchableOpacity } from "react-native"
import { GitPullRequest, Settings, LogIn, LogOut, ArrowLeft, Code } from 'lucide-react-native'
import { useRef, useState, useEffect, useContext } from "react"
import { TabBarContext } from "../../context/TabBarContext"
import { useTheme } from "../../context/ColorMode"
import ThemeChanger from "../../componants/ThemeChanger"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppwriteContext } from "../../context/appwriteContext"
import { login,logout } from "../../backend/appwrite"

function MainNavBar({ state, descriptors, navigation, onHover, prDisabled }) {
  const { theme, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { showTabBar } = useContext(TabBarContext);
  const { isLogged,setIsLogged,setUser } = useAppwriteContext();

  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const borderRadiusAnims = useRef(state.routes.map(() => new Animated.Value(24))).current;
  const leftIndicatorAnims = useRef(state.routes.map(() => new Animated.Value(0))).current;

  
  const navBarAnim = useRef(new Animated.Value(showTabBar ? 67 : 0)).current;

  useEffect(() => {
    Animated.timing(navBarAnim, {
      toValue: showTabBar ? 67 : 0,
      duration: 300, // Increased duration for smoother animation
      useNativeDriver: false, 
    }).start();
  }, [showTabBar]);

  
  const handleMouseEnter = (index) => {
    const route = state.routes[index];
    const isPR = route.name === "PR";
    if (isPR && !isLogged) return; 

    setHoveredIndex(index);
    const { options } = descriptors[state.routes[index].key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : state.routes[index].name;

    
    const itemHeight = 56; 
    const startOffset = 12; 
    const yPosition = startOffset + index * itemHeight + 24; 

    onHover(label, index, yPosition); 

    Animated.timing(scaleAnims[index], {
      toValue: 1.15, // Slightly larger scale for better visual feedback
      duration: 250, // Increased duration
      useNativeDriver: true, 
      easing: Easing.out(Easing.elastic(1)), // More dynamic easing
    }).start();
    Animated.timing(borderRadiusAnims[index], {
      toValue: 12, // More pronounced border radius change
      duration: 250,
      useNativeDriver: false, 
      easing: Easing.out(Easing.elastic(1)),
    }).start();
    if (state.index !== index) {
      Animated.timing(leftIndicatorAnims[index], {
        toValue: 24,
        duration: 250,
        useNativeDriver: false, 
        easing: Easing.out(Easing.elastic(1)),
      }).start();
    }
  };

  
  const handleMouseLeave = (index) => {
    const route = state.routes[index];
    const isPR = route.name === "PR";
    if (isPR && !isLogged) return; 

    setHoveredIndex(null);
    onHover(null, -1, 0); 

    Animated.timing(scaleAnims[index], {
      toValue: 1,
      duration: 250,
      useNativeDriver: true, 
      easing: Easing.out(Easing.elastic(1)),
    }).start();
    Animated.timing(borderRadiusAnims[index], {
      toValue: 24,
      duration: 250,
      useNativeDriver: false, 
      easing: Easing.out(Easing.elastic(1)),
    }).start();
    if (state.index !== index) {
      Animated.timing(leftIndicatorAnims[index], {
        toValue: 0,
        duration: 250,
        useNativeDriver: false, 
        easing: Easing.out(Easing.elastic(1)),
      }).start();
    }
  };

  useEffect(() => {
    state.routes.forEach((route, index) => {
      const isPR = route.name === "PR";
      if (index === state.index) {
        
        leftIndicatorAnims[index].setValue(40);
        scaleAnims[index].setValue(1.15);
        borderRadiusAnims[index].setValue(12);
      } else {
        
        if ((isPR && !isLogged) || hoveredIndex !== index) {
          leftIndicatorAnims[index].setValue(0);
          scaleAnims[index].setValue(1);
          borderRadiusAnims[index].setValue(24);
        }
      }
    });
    
  }, [state.index, isLogged, hoveredIndex]);
  
  const handleLoginLogout=async()=>{
    if(isLogged){
      
      const success = await logout();
      if(success){
        setIsLogged(false);
        setUser(null)
        
        const currentTab = state.routes[state.index].name;
        if(currentTab !== "settings"){
          navigation.navigate("settings");
        }
        router.replace('/log-in')
      }else{
        console.error("Logout failed");
      }
    }else{
      const res= await login();
      if(res){
        setIsLogged(true);
        setUser(res);
      }
    }
  }

  return (
    <Animated.View
      style={{
        width: navBarAnim,
        height: "100%",
        backgroundColor: theme.firstTabBackground,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "column",
          width: 72,
          height: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 12,
          paddingHorizontal: 12,
          position: "relative",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          
          const isPR = route.name === "PR";
          
          const isDisabled = isPR && !isLogged;

          
          const onPress = () => {
            if (isDisabled) return;
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          
          let hoverProps = {};
          if (Platform.OS === "web") {
            if (!(isPR && isDisabled)) {
              hoverProps = {
                onMouseEnter: () => handleMouseEnter(index),
                onMouseLeave: () => handleMouseLeave(index),
              };
            }
          }

          let iconColor;
          if (isFocused || hoveredIndex === index) {
            iconColor = isPR
              ? theme.mode === "dark" ? '#d6a4ff' : '#9c5de0'
              : theme.mode === "dark" ? '#8ae5d3' : '#52b6a4';
          } else {
            iconColor = theme.mode === "dark" ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
          }

          let iconBackgroundColor;
          if (isFocused || hoveredIndex === index) {
            iconBackgroundColor = isPR
              ? theme.mode === "dark" ? 'rgba(214, 164, 255, 0.18)' : 'rgba(156, 93, 224, 0.15)'
              : theme.mode === "dark" ? 'rgba(115, 210, 190, 0.18)' : 'rgba(115, 210, 190, 0.15)';
          } else {
            iconBackgroundColor = theme.mode === "dark" ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
          }

          if (isPR && isDisabled) {
            iconColor = theme.mode === "dark" ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
            iconBackgroundColor = theme.mode === "dark" ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
          }

          // Icon mapping using Lucide icons
          const getIcon = (routeName) => {
            switch (routeName) {
              case "PR":
                return <GitPullRequest size={24} color={iconColor} strokeWidth={2} />;
              case "settings":
                return <Settings size={24} color={iconColor} strokeWidth={2} />;
              default:
                return <Code size={24} color={iconColor} strokeWidth={2} />;
            }
          };

          return (
            <View
              key={route.key}
              style={{
                position: "relative",
                marginBottom: 16,
                zIndex: hoveredIndex === index ? 9999 : 1,
                overflow: "visible",
              }}
            >
              {/* Left indicator bar */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: -12,
                  top: "50%",
                  width: 4,
                  height: isPR && isDisabled ? 0 : leftIndicatorAnims[index],
                  backgroundColor: isPR 
                    ? theme.mode === "dark" ? '#d6a4ff' : '#9c5de0'
                    : theme.mode === "dark" ? '#8ae5d3' : '#52b6a4',
                  borderRadius: 2,
                  transform: [
                    {
                      translateY: (isPR && isDisabled)
                        ? 0
                        : leftIndicatorAnims[index].interpolate({
                            inputRange: [0, 40],
                            outputRange: [0, -20],
                          }),
                    },
                  ],
                  zIndex: 1,
                }}
              />

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                activeOpacity={isDisabled ? 1 : 0.8}
                style={{
                  position: "relative",
                  cursor: Platform.OS === "web" ? (isDisabled ? "not-allowed" : "pointer") : undefined,
                  opacity: isDisabled ? 0.4 : 1,
                }}
                pointerEvents={isDisabled ? "none" : "auto"}
                {...hoverProps}
              >
                <Animated.View
                  style={{
                    width: isDesktop ? 43 : 47,
                    height: isDesktop ? 43 : 47,
                    borderRadius: borderRadiusAnims[index], // Use animated border radius
                    backgroundColor: iconBackgroundColor,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: isPR 
                      ? theme.mode === "dark" ? 'rgba(214, 164, 255, 0.3)' : 'rgba(156, 93, 224, 0.25)'
                      : theme.mode === "dark" ? 'rgba(115, 210, 190, 0.3)' : 'rgba(115, 210, 190, 0.25)',
                    transform: isPR && isDisabled ? [{ scale: 1 }] : [{ scale: scaleAnims[index] }], // Use animated scale
                    overflow: "hidden",
                  }}
                >
                  <View style={{ justifyContent: "center", alignItems: "center" }}>
                    {getIcon(route.name)}
                  </View>
                </Animated.View>
              </TouchableOpacity>
              
            </View>
          );
        })}
        {/* Add login icon at the bottom of the bar */}
        <View style={{ flex: 1 }} />
        <View style={{ marginBottom: 20, alignItems: "center", justifyContent: "flex-end" }}>
         <TouchableOpacity
         onPress={handleLoginLogout}
            style={{
              width: isDesktop ? 44 : 48,
              height: isDesktop ? 44 : 48,
              borderRadius: 16,
              backgroundColor: theme.mode === "dark" 
                ? isLogged ? 'rgba(255, 86, 86, 0.15)' : 'rgba(115, 210, 190, 0.15)'
                : isLogged ? 'rgba(255, 86, 86, 0.12)' : 'rgba(115, 210, 190, 0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              borderWidth: 1,
              borderColor: theme.mode === "dark" 
                ? isLogged ? 'rgba(255, 86, 86, 0.35)' : 'rgba(115, 210, 190, 0.35)'
                : isLogged ? 'rgba(255, 86, 86, 0.25)' : 'rgba(115, 210, 190, 0.25)',
            }}
          >
            {isLogged
              ? <LogOut size={24} color={theme.mode === "dark" ? '#ff7070' : '#e05252'} strokeWidth={2} />
              : <LogIn size={24} color={theme.mode === "dark" ? '#8ae5d3' : '#52b6a4'} strokeWidth={2} />
            }
          </TouchableOpacity>
          <Text style={{
            color: theme.mode === "dark" 
              ? isLogged ? '#ff7070' : '#8ae5d3'
              : isLogged ? '#e05252' : '#52b6a4',
            fontSize: 12, 
            fontWeight: '600',
            marginTop: 4
          }}>{isLogged ? "LogOut" : "LogIn"}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function Layout() {
  const { width, height } = useWindowDimensions()
  const { theme, toggleTheme } = useTheme();
  const isDesktop = width >= 768
  const [showTabBar, setShowTabBar] = useState(true)
  const [hoverInfo, setHoverInfo] = useState({ label: null, index: -1, yPosition: 0 })
  const { isLogged, loading } = useAppwriteContext();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLogged) {
      router.replace("/login");
    }
  }, [isLogged, loading]);

  const safeSetShowTabBar = (value) => {
    if (isDesktop && value === false) {
      return
    }
    setShowTabBar(value)
  }

  useEffect(() => {
    if (isDesktop && !showTabBar) {
      setShowTabBar(true)
    }
  }, [isDesktop, showTabBar])

  
  const handleHover = (label, index, yPosition) => {
    
    if (index !== -1 && label) {
      if (label.toLowerCase().includes("pr") && !isLogged) {
        setHoverInfo({ label: null, index: -1, yPosition: 0 });
        return;
      }
    }
    setHoverInfo({ label, index, yPosition })
  }

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.screenBackground }}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <TabBarContext.Provider value={{ showTabBar, setShowTabBar: safeSetShowTabBar }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.firstTabBackground }}>
      
       
        {hoverInfo.label && Platform.OS === "web" && isDesktop && (
          <View
            style={{
              position: "absolute",
              top: height * 0.028 + hoverInfo.yPosition, 
              left: 80, 
              backgroundColor: theme.mode === 'dark' ? theme.cardBackground : theme.headerBackground,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8, // More rounded corners
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
              zIndex: 99999, 
              minWidth: 80,
              pointerEvents: "none",
            }}
            pointerEvents="none"
          >
            <Text
              style={{
                color: theme.text,
                fontWeight: "600",
                fontSize: 14,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {hoverInfo.label}
            </Text>
           
            <View
              style={{
                position: "absolute",
                left: -6,
                top: "50%",
                transform: [{ translateY: -6 }],
                width: 0,
                height: 0,
                borderTopWidth: 6,
                borderTopColor: "transparent",
                borderBottomWidth: 6,
                borderBottomColor: "transparent",
                borderRightWidth: 6,
                borderRightColor: theme.mode === 'dark' ? theme.cardBackground : theme.headerBackground,
              }}
            />
          </View>
        )}

      {/* Always visible header bar */}
      <View
        style={{
          height: showTabBar?height * 0.07:height * 0.07,
          backgroundColor: theme.firstTabBackground,
          zIndex: 1000,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: isDesktop?'center':'flex-start',
          position: 'relative',
          
        }}
      >
        {isDesktop && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none', 
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                backgroundColor: theme.mode === "dark" ? 'rgba(115, 210, 190, 0.15)' : 'rgba(115, 210, 190, 0.12)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.mode === "dark" ? 'rgba(115, 210, 190, 0.3)' : 'rgba(115, 210, 190, 0.2)',
              }}>
                <Code size={16} color={theme.mode === "dark" ? '#8ae5d3' : '#52b6a4'} strokeWidth={2} />
              </View>
              <Text style={{color:theme.opposite, fontSize: 20, fontWeight: '700' }}>PRIM</Text>
            </View>
            </View>
          </View>
        )}
        {!isDesktop && !showTabBar && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft:10,
              
            }}
          >
            <TouchableOpacity
              onPress={() => setShowTabBar(true)}
              style={{
                borderRadius: 20,
                backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                marginRight: 12,
                padding: 4,
              }}
            >
              <ArrowLeft size={24} color={theme.opposite} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.opposite }}>
              Back
            </Text>
          </View>
        )}

        {isDesktop && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              top: 0,
              bottom: 0,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ThemeChanger focused={theme.mode} onToggle={toggleTheme} />
          </View>
        )}
      </View>

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarPosition: "left",
          }}
          tabBar={(props) => <MainNavBar {...props} onHover={handleHover} prDisabled={!isLogged} />}
        >
         
          <Tabs.Screen
            name="PR"
            options={{
              title: "Pull Requests",
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
        </Tabs>
      </SafeAreaView>
    </TabBarContext.Provider>
  );
}