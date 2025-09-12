"use client"
import { useEffect, useRef, useState } from "react"
import { View, Text, TextInput, Pressable, Animated, Easing, Platform, StyleSheet, Dimensions, ScrollView, Alert, ToastAndroid } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Mail, Lock, User, Eye, EyeOff, Github, Image, GitBranch, Users, Info, CheckCircle2, GitMerge, Star, Zap } from "lucide-react-native"
import { login, EmailPassLogin, EmailPassCreateAccount } from "../backend/appwrite"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from 'expo-status-bar';
import { useAppwriteContext } from '../context/appwriteContext';

// Only one definition of useAnimatedValue, with useNativeDriver: false for compatibility
function useAnimatedValue(show, config = {}) {
  const { from = 0, to = 1, duration = 400, delay = 0, easing = Easing.out(Easing.cubic) } = config
  const animated = useRef(new Animated.Value(from)).current
  useEffect(() => {
    if (show) {
      Animated.timing(animated, {
        toValue: to,
        duration,
        delay,
        useNativeDriver: false,
        easing,
      }).start()
    } else {
      Animated.timing(animated, {
        toValue: from,
        duration: duration / 2,
        useNativeDriver: false,
        easing,
      }).start()
    }
  }, [show])
  return animated
}

function showToast(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    Alert.alert('Error', message)
  }
}

// helpers for color alpha from hex
function hexToRgb(hex) {
  if (!hex) return [253, 54, 110]
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return [r, g, b]
}

function withAlpha(hslColor, alpha) {
  // Convert HSL string to HSLA with alpha
  if (hslColor.includes('hsl(')) {
    return hslColor.replace('hsl(', `hsla(`).replace(')', `, ${alpha})`)
  }
  // Fallback for hex colors
  const [r, g, b] = hexToRgb(hslColor)
  return `rgba(${r},${g},${b},${alpha})`
}

function useScreenWidthPercent() {
  const [screenInfo, setScreenInfo] = useState(() => {
    const { width, height } = Dimensions.get("window")
    return { width, height }
  })

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenInfo({ width: window.width, height: window.height })
    }
    let sub
    if (Dimensions.addEventListener) {
      sub = Dimensions.addEventListener("change", onChange)
    } else if (Dimensions.addEventListener) {
      sub = Dimensions.addEventListener("change", onChange) // legacy fallback
    }
    return () => {
      if (sub && sub.remove) sub.remove()
      else if (Dimensions.removeEventListener) Dimensions.removeEventListener("change", onChange)
    }
  }, [])

  // Hide branding if width < 55% of height (portrait/narrow)
  const isWeb = Platform.OS === "web"
  const hideBranding = screenInfo.width < 0.55 * screenInfo.height || (isWeb && screenInfo.width < 700)

  return { ...screenInfo, hideBranding }
}

const Button = ({ children, variant = "default", style, gradientColors, hoverScale = 1.02, pressScale = 0.98, ...props }) => {
  const hoverAnim = useRef(new Animated.Value(0)).current
  const pressAnim = useRef(new Animated.Value(0)).current

  const animateTo = (animatedValue, toValue, duration = 160) =>
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()

  const onHoverIn = () => animateTo(hoverAnim, 1)
  const onHoverOut = () => animateTo(hoverAnim, 0)
  const onPressIn = () => animateTo(pressAnim, 1, 120)
  const onPressOut = () => animateTo(pressAnim, 0, 120)

  const hoverScaleValue = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [1, hoverScale] })
  const pressScaleValue = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, pressScale] })
  const combinedScale = Animated.multiply(hoverScaleValue, pressScaleValue)

  const baseButtonStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    height: 56,
    minHeight: 48,
    paddingHorizontal: 16,
  }

  const variantStyle =
    variant === "default"
      ? { backgroundColor: gradientColors ? "transparent" : "#FD366E" }
      : { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "#fff3" }

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

  if (gradientColors && Array.isArray(gradientColors)) {
    return (
      <Animated.View style={{ transform: [{ scale: combinedScale }] }}>
        <LinearGradient colors={gradientColors} start={[0, 0]} end={[1, 0]} style={[{ borderRadius: 12, overflow: "hidden" }, style]}>
          <AnimatedPressable
            onHoverIn={Platform.OS === "web" ? onHoverIn : undefined}
            onHoverOut={Platform.OS === "web" ? onHoverOut : undefined}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[baseButtonStyle, { backgroundColor: "transparent" }]}
            {...props}
          >
            {children}
          </AnimatedPressable>
        </LinearGradient>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={{ transform: [{ scale: combinedScale }] }}>
      <AnimatedPressable
        onHoverIn={Platform.OS === "web" ? onHoverIn : undefined}
        onHoverOut={Platform.OS === "web" ? onHoverOut : undefined}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[baseButtonStyle, variantStyle, style]}
        {...props}
      >
        {children}
      </AnimatedPressable>
    </Animated.View>
  )
}

const Input = ({ style, placeholderTextColor, ...props }) => {
  const baseColors = {
    borderColor: 'hsla(240, 100%, 100%, 0.08)',
    backgroundColor: 'hsla(220, 17%, 98%, 0.06)',
    color: 'hsl(160, 14%, 93%)',
  }
  return (
    <TextInput
      style={[
        {
          height: 56,
          borderRadius: 16,
          borderWidth: 1,
          ...baseColors,
          fontSize: 16,
          fontWeight: "400",
          paddingHorizontal: 16,
          marginTop: 0,
          marginBottom: 0,
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor || 'hsla(160, 14%, 93%, 0.7)'}
      {...props}
    />
  )
}

const Label = ({ children, style, ...props }) => (
  <View
    style={[
      {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)



import ForgotPasswordModal from "../componants/ForgotPasswordModal";

export default function LoginSampleCombined() {
  // Direct color values - no theme system
  const [animationStage, setAnimationStage] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showGitHubTip, setShowGitHubTip] = useState(false)
  const {setIsLogged, setUser} = useAppwriteContext();
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Animated mode progress (0 = login, 1 = signup) and card expansion
  const modeAnim = useRef(new Animated.Value(0)).current
  const cardExtra = useRef(new Animated.Value(0)).current
  const extraPadding = cardExtra.interpolate({ inputRange: [0, 1], outputRange: [0, 110] })

  // GitHub tip animation
  const gitHubTipAnim = useRef(new Animated.Value(0)).current

  const animateMode = (target) => {
    const toValue = target === 'signup' ? 1 : 0
    setMode(target)
    Animated.parallel([
      Animated.timing(modeAnim, { toValue, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(cardExtra, { toValue, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start()
  }

  const animateGitHubTip = (show) => {
    setShowGitHubTip(show)
    Animated.timing(gitHubTipAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }

  // Remove duplicate useEffect for animationStage
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setAnimationStage(1), 50), // Background effects
      setTimeout(() => setAnimationStage(2), 150), // Geometric shapes
      setTimeout(() => setAnimationStage(3), 150), // Left sidebar
      setTimeout(() => setAnimationStage(4), 150), // Branding
      setTimeout(() => setAnimationStage(5), 150), // Feature cards
      setTimeout(() => setAnimationStage(6), 150), // Login form
      setTimeout(() => setAnimationStage(7), 150), // Form fields
      setTimeout(() => setAnimationStage(8), 150), // Social buttons
    ]
    return () => timeouts.forEach(clearTimeout)
  }, [])



  // Animations (local to card)
  const loginCardTrans = useAnimatedValue(animationStage >= 6, { from: 32, to: 0, duration: 600 })
  const loginCardOpacity = useAnimatedValue(animationStage >= 6, { from: 0, to: 1, duration: 600 })
  const loginCardScale = useAnimatedValue(animationStage >= 6, { from: 0.95, to: 1, duration: 600 })

  const sparkleScale = useAnimatedValue(animationStage >= 6, { from: 0, to: 1, duration: 400, delay: 100 })
  const sparkleRotate = useAnimatedValue(animationStage >= 6, { from: 180, to: 0, duration: 400, delay: 100 })

  const formHeaderTrans = useAnimatedValue(animationStage >= 6, { from: 16, to: 0, duration: 400, delay: 200 })
  const formHeaderOpacity = useAnimatedValue(animationStage >= 6, { from: 0, to: 1, duration: 400, delay: 200 })

  const emailTrans = useAnimatedValue(animationStage >= 7, { from: 16, to: 0, duration: 300, delay: 100 })
  const emailOpacity = useAnimatedValue(animationStage >= 7, { from: 0, to: 1, duration: 300, delay: 100 })

  const passTrans = useAnimatedValue(animationStage >= 7, { from: 16, to: 0, duration: 300, delay: 200 })
  const passOpacity = useAnimatedValue(animationStage >= 7, { from: 0, to: 1, duration: 300, delay: 200 })

  const dividerOpacity = useAnimatedValue(animationStage >= 8, { from: 0, to: 1, duration: 300, delay: 100 })
  const signupTrans = useAnimatedValue(animationStage >= 8, { from: 16, to: 0, duration: 300, delay: 500 })
  const signupOpacity = useAnimatedValue(animationStage >= 8, { from: 0, to: 1, duration: 300, delay: 500 })

  // Animations for sign-up only fields
  const nameTrans = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] })
  const nameOpacity = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  const confirmTrans = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] })
  const confirmOpacity = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })

  const headerTitle = mode === 'signup' ? 'Create your PRIM account' : 'Welcome back to PRIM'
  const headerSubtitle = mode === 'signup'
    ? 'Join PRIM to enhance your code reviews'
    : 'LLM-powered PR reviews and GitHub workflow learning'

  // Animated values for each section
  const bgOpacity = useAnimatedValue(animationStage >= 1, { from: 0, to: 1, duration: 500 })
  const leftSidebarTrans = useAnimatedValue(animationStage >= 3, { from: -80, to: 0, duration: 600 })
  const leftSidebarOpacity = useAnimatedValue(animationStage >= 3, { from: 0, to: 1, duration: 600 })
  const logoTrans = useAnimatedValue(animationStage >= 4, { from: 32, to: 0, duration: 400, delay: 100 })
  const logoOpacity = useAnimatedValue(animationStage >= 4, { from: 0, to: 1, duration: 400, delay: 100 })
  const headingTrans = useAnimatedValue(animationStage >= 4, { from: 32, to: 0, duration: 400, delay: 200 })
  const headingOpacity = useAnimatedValue(animationStage >= 4, { from: 0, to: 1, duration: 400, delay: 200 })
  const descTrans = useAnimatedValue(animationStage >= 4, { from: 32, to: 0, duration: 400, delay: 300 })
  const descOpacity = useAnimatedValue(animationStage >= 4, { from: 0, to: 1, duration: 400, delay: 300 })


  // --- LAYOUT FIX: Place login card on the left for web, right for mobile ---
  // We'll use flexDirection: row for web, column for mobile, and order the children accordingly

  const isWeb = Platform.OS === "web"

  // --- Responsive: Hide branding if screen is "narrow" (see hook above) ---
  const { hideBranding } = useScreenWidthPercent()

  // Fix: onError handler for error messages
  function onError(msg) {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(""), 4000)
  }

  // Fix: setUser and setIsLogged are not defined, so we remove them for now
  // You should connect to your user context/store if needed

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'hsl(210, 11%, 7%)' }}>
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: 'hsl(210, 11%, 7%)' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            minHeight: Platform.OS === 'web' ? '100vh' : undefined,
            backgroundColor: 'hsl(210, 11%, 7%)',
            flex: 1,
            flexDirection: isWeb ? "row-reverse" : "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
              position: "relative",
              zIndex: 20,
              order: isWeb ? 0 : 1,
            }}
          >
            <View style={{ width: "100%", maxWidth: 480, position: "relative" }}>
              {errorMessage ? (
                <View style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  borderColor: 'rgba(244, 63, 94, 0.35)',
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 12,
                }}>
                  <Text style={{ color: '#ef4444', fontFamily: 'Poppins-SemiBold' }}>{errorMessage}</Text>
                </View>
              ) : null}
              <Animated.View
                style={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: 'hsla(240, 100%, 100%, 0.12)',
                  ...(Platform.OS === 'web' ? { backdropFilter: "blur(20px)" } : {}),
                  backgroundColor: 'hsla(220, 17%, 98%, 0.08)',
                  shadowColor: 'hsl(165, 96%, 71%)',
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 10 },
                  position: "relative",
                  overflow: 'hidden',
                  transform: [
                    { translateY: loginCardTrans },
                    { scale: loginCardScale },
                  ],
                  opacity: loginCardOpacity,
                }}
              >
                {/* Animated gradient overlay */}
                <LinearGradient
                  colors={[
                    'hsla(165, 96%, 71%, 0.08)',
                    'transparent',
                    'hsla(160, 100%, 50%, 0.06)',
                    'transparent',
                    'hsla(165, 96%, 71%, 0.04)'
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.8 }]}
                  pointerEvents="none"
                />
                
                {/* Subtle pattern overlay */}
                <View style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: 'hsla(220, 17%, 98%, 0.03)',
                    opacity: 0.6
                  }
                ]} />

                {/* Success indicator floating animation */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    transform: [
                      { rotate: sparkleRotate.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) },
                      { scale: sparkleScale }
                    ],
                    opacity: sparkleScale,
                  }}
                  pointerEvents="none"
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'hsla(165, 96%, 71%, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
                  }}>
                    <CheckCircle2 size={20} color="hsl(165, 96%, 71%)" />
                  </View>
                </Animated.View>

                {/* Padded content */}
                <View style={{ padding: 24, paddingTop: 40, paddingBottom: 24 }}>
                  {/* Enhanced Form header */}
                  <Animated.View
                    style={{
                      marginBottom: 32,
                      transform: [{ translateY: formHeaderTrans }],
                      opacity: formHeaderOpacity,
                      alignItems: 'center',
                    }}
                  >
                    {/* Animated logo */}
                    <Animated.View
                      style={{
                        marginBottom: 20,
                        transform: [{ scale: sparkleScale }],
                        opacity: sparkleScale,
                      }}
                    >
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 20,
                        backgroundColor: 'hsl(165, 96%, 71%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: 'hsl(165, 96%, 71%)',
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                      }}>
                        <Text style={{ color: 'hsl(160, 8%, 6%)', fontWeight: 'bold', fontSize: 24 }}>P</Text>
                      </View>
                    </Animated.View>
                    
                    <Text style={{ 
                      fontSize: 32, 
                      fontWeight: "700", 
                      color: 'hsl(160, 14%, 93%)', 
                      marginBottom: 8, 
                      textAlign: 'center',
                      lineHeight: 38 
                    }}>
                      {headerTitle}
                    </Text>
                    
                    <Text style={{ 
                      color: 'hsla(160, 14%, 93%, 0.8)', 
                      fontSize: 16, 
                      fontWeight: "500", 
                      textAlign: 'center',
                      lineHeight: 24,
                      paddingHorizontal: 12
                    }}>
                      {headerSubtitle}
                    </Text>
                  </Animated.View>

                  <View style={{ gap: 20 }}>
                    {/* Name field (animated for sign up) */}
                    <Animated.View
                      style={{
                        height: modeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 96] }),
                        overflow: 'hidden',
                      }}
                      pointerEvents={mode === 'signup' ? 'auto' : 'none'}
                    >
                      <Animated.View style={{ gap: 12, transform: [{ translateX: nameTrans }], opacity: nameOpacity }}>
                        <Label>
                          <User size={16} color="hsl(165, 96%, 71%)" />
                          <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontWeight: '500', marginLeft: 8 }}>Name</Text>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={name}
                          onChangeText={setName}
                          autoCapitalize="words"
                        />
                      </Animated.View>
                    </Animated.View>
                    {/* Email field */}
                    <Animated.View
                      style={{
                        gap: 12,
                        transform: [{ translateX: emailTrans }],
                        opacity: emailOpacity,
                      }}
                    >
                      <Label>
                        <Mail size={16} color="hsl(165, 96%, 71%)" />
                        <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontWeight: '500', marginLeft: 8 }}>Email Address</Text>
                      </Label>
                      <Input
                        id="email"
                        keyboardType="email-address"
                        placeholder="Enter your email address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        spellCheck={false}
                        onFocus={() => {
                          if (mode === 'signup') {
                            animateGitHubTip(true)
                          }
                        }}
                        onBlur={() => {
                          if (mode === 'signup') {
                            animateGitHubTip(false)
                          }
                        }}
                      />

                      {/* GitHub email note - only show in signup mode */}
                      <Animated.View
                        style={{
                          height: gitHubTipAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] }),
                          overflow: 'hidden',
                          opacity: gitHubTipAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                        }}
                        pointerEvents={showGitHubTip ? 'auto' : 'none'}
                      >
                        <View style={{
                          backgroundColor: 'hsla(165, 96%, 71%, 0.08)',
                          borderLeftWidth: 3,
                          borderLeftColor: 'hsl(165, 96%, 71%)',
                          borderRadius: 12,
                          padding: 16,
                          marginTop: 8,
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}>
                          <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: 'hsla(165, 96%, 71%, 0.15)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 2,
                          }}>
                            <Info size={12} color="hsl(165, 96%, 71%)" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: 'hsl(160, 14%, 93%)',
                              fontSize: 15,
                              fontWeight: '600',
                              marginBottom: 4,
                            }}>
                              GitHub Integration Tip
                            </Text>
                            <Text style={{
                              color: 'hsla(160, 14%, 93%, 0.7)',
                              fontSize: 14,
                              fontWeight: '400',
                              lineHeight: 18,
                            }}>
                              Use the same email address that's connected to your GitHub account for seamless repository linking and collaboration features.
                            </Text>
                          </View>
                        </View>
                      </Animated.View>
                    </Animated.View>

                    {/* Password field */}
                    <Animated.View
                      style={{
                        gap: 12,
                        transform: [{ translateX: passTrans }],
                        opacity: passOpacity,
                      }}
                    >
                      <Label>
                        <Lock size={16} color="hsl(165, 96%, 71%)" />
                        <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontWeight: '500', marginLeft: 8 }}>Password</Text>
                      </Label>
                      <View style={{ position: "relative" }}>
                        <Input
                          id="password"
                          secureTextEntry={!showPassword}
                          placeholder="Enter your password"
                          style={{ paddingRight: 48 }}
                          value={password}
                          onChangeText={setPassword}
                          autoCapitalize="none"
                          autoComplete="password"
                        />
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: [{ translateY: -12 }],
                            zIndex: 2,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color="#9ca3af" />
                          ) : (
                            <Eye size={20} color="#9ca3af" />
                          )}
                        </Pressable>
                      </View>
                    </Animated.View>

                    {/* Confirm password (animated for sign up) */}
                    <Animated.View
                      style={{
                        height: modeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 96] }),
                        overflow: 'hidden',
                      }}
                      pointerEvents={mode === 'signup' ? 'auto' : 'none'}
                    >
                      <Animated.View style={{ gap: 12, transform: [{ translateX: confirmTrans }], opacity: confirmOpacity }}>
                        <Label>
                          <Lock size={16} color="hsl(165, 96%, 71%)" />
                          <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontWeight: '500', marginLeft: 8 }}>Retype Password</Text>
                        </Label>
                        <Input
                          id="confirmPassword"
                          secureTextEntry={!showPassword}
                          placeholder="Retype your password"
                          style={{ paddingRight: 48 }}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          autoCapitalize="none"
                          autoComplete="password-new"
                        />
                      </Animated.View>
                    </Animated.View>

                    {/* Forgot password link (login only) */}
                    <Animated.View
                      style={{
                        height: modeAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
                        overflow: 'hidden',
                        marginTop: -8,
                      }}
                      pointerEvents={mode === 'login' ? 'auto' : 'none'}
                    >
                      <Animated.View style={{ alignItems: 'flex-end', opacity: modeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
                        <Pressable onPress={() => setShowForgotPassword(true)}>
                          <Text style={{ color: 'hsl(165, 96%, 71%)', fontWeight: "500", fontSize: 14 }}>
                            Forgot Password?
                          </Text>
                        </Pressable>
                      </Animated.View>
                    </Animated.View>

                    {/* Sign in button */}
                    <Button
                      gradientColors={['hsl(165, 96%, 71%)', 'hsla(165, 96%, 71%, 0.8)']}
                      style={{
                        width: "100%",
                        height: 56,
                        borderRadius: 16,
                        shadowColor: 'hsl(165, 96%, 71%)',
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        borderWidth: 0,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: -4,
                        marginBottom: 0,
                      }}
                      onPress={async () => {
                        if (mode === 'signup') {
                          if (!name || !email || !password || password !== confirmPassword) {
                            onError('Please fill all fields and ensure passwords match');
                            showToast('Please fill all fields and ensure passwords match');
                            return;
                          }
                          try {
                            const res = await EmailPassCreateAccount(name, email, password);
                            if (!res) {
                              onError('Signup failed');
                              showToast('Signup failed');
                              return;
                            }
                            const res2 = await EmailPassLogin(email, password);
                            setUser(res2);
                            setIsLogged(true);
                            if (res2) {
                              router.replace('/screens');
                            }
                          } catch (e) {
                            onError(e?.message || 'Signup failed');
                            showToast(e?.message || 'Signup failed');
                          }
                        } else {
                          try {
                            const res2 = await EmailPassLogin(email, password);
                            setUser(res2); 
                            setIsLogged(true); 
                            router.replace('/screens');
                          } catch (e) {
                            onError(e?.message || 'Login failed');
                            showToast(e?.message || 'Login failed');
                          }
                        }
                      }}
                    >
                      <Text style={{ color: 'hsl(160, 8%, 6%)', fontWeight: "500", fontSize: 16 }}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>
                    </Button>

                    {/* Divider */}
                    <Animated.View
                      style={{
                        position: "relative",
                        opacity: dividerOpacity,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                    >
                      <View style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "50%",
                        height: 1,
                        backgroundColor: "hsla(240, 100%, 100%, 0.12)",
                      }} />
                      <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                      }}>
                        <Text style={{
                          paddingHorizontal: 16,
                          backgroundColor: 'hsl(210, 11%, 7%)',
                          color: 'hsla(160, 14%, 93%, 0.7)',
                          fontWeight: "400",
                          fontSize: 14,
                          borderRadius: 8,
                        }}>{mode === 'signup' ? 'Or sign up with' : 'Or continue with'}</Text>
                      </View>
                    </Animated.View>

                    <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
                      <Button
                        variant="outline"
                        hoverScale={1.06}
                        style={{
                          width: 56,
                          height: 48,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          margin: 0,
                          backgroundColor: 'hsla(220, 17%, 98%, 0.06)',
                          borderColor: 'hsla(240, 100%, 100%, 0.08)',
                          borderWidth: 1,
                          shadowColor: '#000',
                          shadowOpacity: 0.2,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 6 },
                        }}
                        onPress={async () => {
                          try {
                            const res= await login();
                            if(Platform.OS!=='web'){
                              if (res) {
                                setUser(res);
                                setIsLogged(true);
                                
                                router.replace('/screens');
                              }
                            }
                            
                          } catch (e) {
                            onError(e?.message || 'GitHub login failed');
                            showToast(e?.message || 'GitHub login failed');
                          }
                        }}
                      >
                        <Github size={22} color="hsl(160, 14%, 93%)" />
                      </Button>
                      <Text style={{ color: 'hsl(160, 14%, 93%)',  fontSize: 16, fontWeight: "500", alignSelf: "center" }}>GitHub</Text>
                    </View>
                  </View>

                  {/* Mode switch link */}
                  <Animated.View
                    style={{
                      marginTop: 10,
                      alignItems: "center",
                      transform: [{ translateY: signupTrans }],
                      opacity: signupOpacity,
                    }}
                  >
                    {mode === 'login' ? (
                      <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontSize: 16, fontWeight: "400" }}>
                        New to PRIM?{" "}
                        <Pressable onPress={() => animateMode('signup')}>
                          <Text style={{ color: 'hsl(165, 96%, 71%)', fontWeight: "500", top: Platform.OS === 'web' ? 0 : 5, fontSize: 16 }}>
                            Sign up
                          </Text>
                        </Pressable>
                      </Text>
                    ) : (
                      <Text style={{ color: 'hsla(160, 14%, 93%, 0.7)', fontSize: 16, fontWeight: "400" }}>
                        Already on PRIM?{" "}
                        <Pressable onPress={() => animateMode('login')}>
                          <Text style={{ color: 'hsl(165, 96%, 71%)', fontWeight: "500", top: Platform.OS === 'web' ? 0 : 5, fontSize: 16 }}>
                            Sign in
                          </Text>
                        </Pressable>
                      </Text>
                    )}
                  </Animated.View>

                  {/* Card expansion/compression spacer */}
                  <Animated.View style={{ height: extraPadding }} />
                </View>

                {/* Forgot Password Modal */}
                <ForgotPasswordModal
                  visible={showForgotPassword}
                  onClose={() => setShowForgotPassword(false)}
                />
              </Animated.View>
            </View>
          </View>
          {!hideBranding && (
            <Animated.View
              style={{
                display: isWeb ? "flex" : "none",
                flexDirection: "column",
                width: isWeb ? "40%" : "100%",
                position: "relative",
                zIndex: 10,
                transform: [{ translateX: leftSidebarTrans }],
                opacity: leftSidebarOpacity,
                height: "100%",
                order: isWeb ? 1 : 0, // right on web, above on mobile
              }}
            >
              <View style={{
                backgroundColor: "hsla(220, 17%, 98%, 0.05)",
                ...(Platform.OS === 'web' ? { backdropFilter: "blur(24px)" } : {}),
                borderRightWidth: 1,
                borderRightColor: 'hsla(240, 100%, 100%, 0.08)',
                height: "100%",
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
                padding: 48,
                position: "relative",
              }}>
                <View style={{ marginBottom: 32 }}>
                  {/* Logo and brand name */}
                  <Animated.View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 24,
                      transform: [{ translateY: logoTrans }],
                      opacity: logoOpacity,
                    }}
                  >
                    <View style={{ 
                      width: 38, 
                      height: 38, 
                      backgroundColor: 'hsl(165, 96%, 71%)', 
                      borderRadius: 12, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>P</Text>
                    </View>
                    <Text style={{ fontSize: 28, fontWeight: "600", color: 'hsl(160, 14%, 93%)' }}>PRIM</Text>
                  </Animated.View>
                  {/* Main heading */}
                  <Animated.View
                    style={{
                      transform: [{ translateY: headingTrans }],
                      opacity: headingOpacity,
                    }}
                  >
                    <Text style={{ fontSize: 40, fontWeight: "600", color: 'hsl(160, 14%, 93%)', marginBottom: 24, lineHeight: 48 }}>
                      Pull.Refactor
                      {"\n"}
                      <Text>Inspect.Merge</Text>
                    </Text>
                  </Animated.View>
                  <Animated.Text
                    style={{
                      fontSize: 20,
                      color: 'hsla(160, 14%, 93%, 0.7)',
                      marginBottom: 48,
                      transform: [{ translateY: descTrans }],
                      opacity: descOpacity,
                      fontWeight: "400",
                    }}
                  >
                    LLM-powered PR reviews and documentation that help you learn GitHub workflows while improving your code quality.
                  </Animated.Text>
                </View>

              </View>
            </Animated.View>
          )}
          
          {/* Background Effects inspired by premium design */}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { zIndex: 0, opacity: bgOpacity }]}
          >
            {/* Main gradient background */}
            <LinearGradient
              colors={[
                'hsla(210, 11%, 7%, 1)',
                'hsla(165, 96%, 71%, 0.02)',
                'hsla(210, 11%, 7%, 1)',
                'hsla(160, 100%, 50%, 0.03)',
                'hsla(210, 11%, 7%, 1)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Animated mesh gradient overlay */}
            <View style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'transparent',
                ...(Platform.OS === 'web' ? {
                  background: 'radial-gradient(circle at 20% 50%, hsla(165, 96%, 71%, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsla(160, 100%, 50%, 0.06) 0%, transparent 50%), radial-gradient(circle at 40% 80%, hsla(165, 96%, 71%, 0.04) 0%, transparent 50%)'
                } : {})
              }
            ]} />
          </Animated.View>
        </View>
      </ScrollView>
      <StatusBar style='light' />
    </SafeAreaView>
  )
}
