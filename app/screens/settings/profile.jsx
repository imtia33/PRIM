import { useState, useEffect, useRef } from "react"
import { Platform,Dimensions, Image, ScrollView, Text, View,TouchableOpacity,Animated,TextInput,KeyboardAvoidingView, Linking } from "react-native"
import { MaterialCommunityIcons, MaterialIcons, Feather, FontAwesome, Octicons, Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../context/ColorMode"
import { useAppwriteContext } from "../../../context/appwriteContext"
import { account, updateUserName, updateUserEmail, updateUserPreferences } from "../../../backend/appwrite"
import AsyncStorage from "@react-native-async-storage/async-storage"

function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: Dimensions.get("window").width,
    isMobile: Dimensions.get("window").width < 640,
    isTablet: Dimensions.get("window").width < 1024,
  })
  

  useEffect(() => {
    const handleChange = ({ window }) => {
      setScreenSize({
        width: window.width,
        isMobile: window.width < 640,
        isTablet: window.width < 1024,
      })
    }
    const sub = Dimensions.addEventListener("change", handleChange)
    return () => {
      if (sub?.remove) sub.remove()
      else Dimensions.removeEventListener("change", handleChange)
    }
  }, [])

  return screenSize
}

// Removed useSlideInAnimation (no longer needed for cards)

function usePulseAnimation(isActive) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.05 : 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  return {
    transform: `scale(${scale})`,
    transition: "transform 0.3s ease-in-out",
  }
}

export default function ProfileScreen() {
  const {user, isGithubLinked, gitAccToken, tokenExpiry, gitUserInfo, gitRateLimit, getCurrentApiUsage, apiKey, updateApiKey} = useAppwriteContext()
  const [githubConnected, setGithubConnected] = useState(false)
  // const [timeLeft, setTimeLeft] = useState(86400) // 24 hours in seconds
  const [apiTimeLeft, setApiTimeLeft] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null) // Add success message state
  // Removed mounted state and effect
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "",
  })
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [password, setPassword] = useState("")
  // API Key states (using global state now)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")

  // Animation for password field
  const passwordFieldOpacity = useRef(new Animated.Value(0)).current
  const passwordFieldHeight = useRef(new Animated.Value(0)).current
  // Animation for API key field
  const apiKeyFieldOpacity = useRef(new Animated.Value(0)).current
  const apiKeyFieldHeight = useRef(new Animated.Value(0)).current

  // Initialize editData with user data
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        role: user.prefs?.role || "",
      })
    }
  }, [user])

  // Animate password field appearance
  useEffect(() => {
    if (showPasswordField) {
      Animated.parallel([
        Animated.timing(passwordFieldOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(passwordFieldHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(passwordFieldOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(passwordFieldHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start()
    }
  }, [showPasswordField, passwordFieldOpacity, passwordFieldHeight])

  // Animate API key field appearance
  useEffect(() => {
    if (showApiKeyInput) {
      Animated.parallel([
        Animated.timing(apiKeyFieldOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(apiKeyFieldHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(apiKeyFieldOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(apiKeyFieldHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start()
    }
  }, [showApiKeyInput, apiKeyFieldOpacity, apiKeyFieldHeight])

  const { isMobile, isTablet } = useResponsive()
  const { theme } = useTheme()
  const isDark = theme.mode === "dark"

  const colors = isDark
    ? {
        background: "rgb(6, 10, 17)",
        foreground: "#f1f5f9",
        card: "rgb(7, 12, 21)",
        cardForeground: "#f1f5f9",
        primary: "#15803d",
        primaryForeground: "#fef2f2",
        secondary: "#1e293b",
        secondaryForeground: "#f1f5f9",
        muted: "#1e293b",
        mutedForeground: "#94a3b8",
        accent: "#1e293b",
        accentForeground: "#f1f5f9",
        destructive: "#7f1d1d",
        destructiveForeground: "#f1f5f9",
        border: "#1e293b",
        input: "#1e293b",
        ring: "#15803d",
      }
    : {
        background: "rgb(236, 244, 240)",
        foreground: "#0f172a",
        card: "#fff",
        cardForeground: "#0f172a",
        primary: "#22c55e",
        primaryForeground: "#052e16",
        secondary: "#f1f5f9",
        secondaryForeground: "#0f172a",
        muted: "#f1f5f9",
        mutedForeground: "#64748b",
        accent: "#f1f5f9",
        accentForeground: "#0f172a",
        destructive: "#ef4444",
        destructiveForeground: "#f1f5f9",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#22c55e",
      }

  // Load API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem("gemini_api_key");
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error("Failed to load API key", error);
      }
    };
    
    loadApiKey();
  }, []);

  // Calculate API usage from GitHub rate limit data with local tracking
  const currentApiUsage = getCurrentApiUsage();
  const apiUsage = currentApiUsage.used;
  const apiLimit = currentApiUsage.limit;
  const resetTime = gitRateLimit?.resources?.core?.reset ? new Date(gitRateLimit.resources.core.reset * 1000) : null

  // API Rate Limit Countdown Timer
  useEffect(() => {
    if (resetTime) {
      const updateTimeLeft = () => {
        const now = new Date();
        const diff = resetTime - now;
        const timeLeft = Math.max(0, Math.floor(diff / 1000));
        setApiTimeLeft(timeLeft);
      };
      
      updateTimeLeft(); // Initial calculation
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    } else {
      setApiTimeLeft(0);
    }
  }, [resetTime]);

  const formatApiTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };



  const usagePercentage = apiLimit > 0 ? (apiUsage / apiLimit) * 100 : 0

  // Calculate time until reset
  const getTimeUntilReset = () => {
    if (!resetTime) return "Unknown";
    const now = new Date();
    const diff = resetTime - now;
    if (diff <= 0) return "Resets soon";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    // Clear success message when toggling edit mode
    if (successMessage) setSuccessMessage(null)
  }

  // Update the handleSave function to include email update with password
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null) // Clear any previous success message
    
    try {
      let updatesMade = false;
      
      // Update user name
      if (editData.name !== user?.name) {
        const result = await updateUserName(editData.name)
        console.log('Name updated:', result)
        updatesMade = true;
      }
      
      // Update user email (requires password)
      if (editData.email !== user?.email) {
        if (!password) {
          throw new Error('Password is required to update email')
        }
        const result = await updateUserEmail(editData.email, password)
        updatesMade = true;
      }
      
      // Update user preferences (role)
      const prefs = {
        ...user?.prefs,
        role: editData.role
      }
      
      // Only update prefs if role has changed
      if (editData.role !== (user?.prefs?.role || "")) {
        const promise = await updateUserPreferences(prefs)
        updatesMade = true;
      }
      
      // Show success message
      if (updatesMade) {
        setSuccessMessage('Profile updated successfully!')
      } else {
        setSuccessMessage('No changes to save')
      }
      
      // Update local state
      setIsEditing(false)
      setShowPasswordField(false)
      setPassword("")
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
      setSuccessMessage(null) // Clear success message on error
    } finally {
      setLoading(false)
    }
  }

  // Add validation before saving
  const handleSaveWithValidation = async () => {
    if (editData.email !== user?.email && !password) {
      setError('Password is required to update your email address')
      return
    }
    
    if (editData.email !== user?.email && password.length < 1) {
      setError('Please enter your password to update your email')
      return
    }
    
    handleSave()
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.prefs?.role || "",
    })
    setShowPasswordField(false)
    setPassword("")
    setError(null)
    setSuccessMessage(null) // Clear success message
    setIsEditing(false)
  }

  // Detect email changes to show password field
  useEffect(() => {
    if (isEditing && editData.email !== user?.email) {
      setShowPasswordField(true)
      // Clear success message when making changes
      setSuccessMessage(null)
    } else if (isEditing && editData.email === user?.email) {
      setShowPasswordField(false)
      setPassword("")
      // Clear error when email is changed back to original
      if (error && error.includes('email')) {
        setError(null)
      }
    }
  }, [editData.email, user?.email, isEditing, error])

  const handleRefreshToken = async () => {
    try {
      const success = await refreshGithubToken();
      if (success) {
        console.log('Token refreshed successfully');
      } else {
        console.log('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }

  // Handle API key save using global state
  const handleSaveApiKey = async () => {
    try {
      await updateApiKey(tempApiKey);
      setTempApiKey("");
      setShowApiKeyInput(false);
      setSuccessMessage('API key updated successfully!')
    } catch (error) {
      console.error("Failed to save API key", error);
      setError('Failed to save API key. Please try again.')
    }
  }

  // Handle API key cancel
  const handleCancelApiKey = () => {
    setTempApiKey("");
    setShowApiKeyInput(false);
    setError(null);
  }

  const Icons = {
    Github: (props) => <Feather size={22} name="github" {...props} />,
    Clock: (props) => <Feather size={22} name="clock" {...props} />,
    Clock2: (props) => <Feather size={12} name="clock" {...props} />,
    Zap: (props) => <Feather size={22} name="zap" {...props} />,
    Shield: (props) => <MaterialIcons size={22} name="verified-user" {...props} />,
    Settings: (props) => <Feather size={20} name="settings" {...props} />,
    User: (props) => <Feather size={18} name="user" {...props} />,
    Key: (props) => <Feather  size={22 }name="key" {...props} />,
    BarChart3: (props) => <Feather size={22} name="bar-chart-2" {...props} />,
    CheckCircle: (props) => <Feather size={22} name="check-circle" {...props} />,
    CheckCircle2: (props) => <Feather size={14} name="check-circle" {...props} />,
    AlertTriangle: (props) => <Feather size={14} name="alert-triangle" {...props} />,
  }

  // Card shadow for visible card area
  const cardShadow = "0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)"

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{
        minHeight: '100%',
        backgroundColor: colors.background,
        padding: isMobile ? 16 : isTablet ? 24 : 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
        display: "flex",
        ...(Platform.OS === 'web'
          ? {
              color: colors.foreground,
              transition: "all 0.3s ease-in-out",
            }
          : {}),
        paddingBottom: 32,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 1400,
          display: Platform.OS === 'web' ? "grid" : "flex",
          ...(Platform.OS === 'web'
            ? {
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "400px 1fr",
                gap: isMobile ? 16 : isTablet ? 24 : 32,
                gridTemplateRows: "auto",
              }
            : {}),
        }}
      >

        <View
          style={{
            // ...profileCardAnimation, // removed animation
            ...(Platform.OS === 'web'
              ? { gridColumn: "1" }
              : {}),
            position: isMobile ? "static" : "sticky",
            top: isMobile ? "auto" : 32,
            height: "fit-content",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom:15,
            boxShadow: cardShadow,
            ...(Platform.OS === 'web'
              ? {
                  color: colors.foreground,
                  transition: "all 0.3s ease-in-out",
                }
              : {}),
          }}
        >
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.cardForeground,
              boxShadow: "none",
              ...(Platform.OS === 'web'
                ? { backdropFilter: "blur(10px)" }
                : {}),
              transition: "all 0.3s ease-in-out",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: 24,
                textAlign: "center",
                paddingBottom: 16,
              }}
            >
              <View style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <View
                  style={{
                    position: "relative",
                    display: "flex",
                    height: 96,
                    width: 96,
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: 48,
                    borderWidth: 4,
                    borderColor: `${colors.primary}33`,
                    transform: [{ scale: 1 }],
                    transition: "transform 0.3s ease-in-out",
                    alignSelf:'center'
                  }}
                >
                  {Platform.OS === 'web' ? (
                    <img
                      src={gitUserInfo?.avatar_url || undefined}
                      alt={user?.name || "User avatar"}
                      style={{
                        aspectRatio: 1,
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease-in-out",
                        alignSelf: 'center',
                        display: "block",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Image
                      style={{
                        aspectRatio: 1,
                        height: "100%",
                        width: "100%",
                        transition: "transform 0.3s ease-in-out",
                        alignSelf: 'center',
                      }}
                      source={{ uri: gitUserInfo?.avatar_url || undefined }}
                      alt={user?.name || "User avatar"}
                    />
                  )}
                </View>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  lineHeight: 20,
                  letterSpacing: -0.4,
                  color: colors.cardForeground,
                  alignSelf:'center'
                }}
              >
                {user?.name ? user.name : (gitUserInfo?.name || "")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.mutedForeground ,alignSelf:'center'}}>{user?.email || ""}</Text>
              {gitUserInfo?.login && (
              <TouchableOpacity
                style={{
                  ...(Platform.OS === 'web'
                    ? { display: "inline-flex" }
                    : { display: "flex" }),
                  alignItems: "center",
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 2,
                  paddingBottom: 2,
                  fontSize: 12,
                  fontWeight: "600",
                  transition: "colors 0.2s",
                  backgroundColor: colors.secondary,
                  color: colors.secondaryForeground,
                  width: "fit-content",
                  ...(Platform.OS === 'web'
                    ? { margin: "0 auto" }
                    : {}),
                  marginTop: 8,
                  alignSelf:'center'
                }}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    if (gitUserInfo?.html_url) window.open(gitUserInfo.html_url, '_blank');
                  } else {
                    if (gitUserInfo?.html_url) Linking.openURL(gitUserInfo.html_url);
                  }
                }}
              >
                <Text style={{ color: colors.secondaryForeground, fontSize: 12, fontWeight: "600" }}>
                  {gitUserInfo?.login}
                </Text>
              </TouchableOpacity>
              )}
            </View>

            <View style={{ padding: 24, paddingTop: 0 }}>
              <View
                style={{
                  flexDirection: "column",
                  gap: 12,
                  fontSize: 14,
                  color: colors.mutedForeground,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8,left:2 }}>
                  <Icons.User style={{ height: 18, width: 18, color: colors.cardForeground }} />
                  <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                    Joined {user?.registration ? new Date(user.registration).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "—"}
                  </Text>
                </View>
                {isGithubLinked && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Icons.Shield style={{ height: 22, width: 22, color: colors.primary }} />
                  <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                    Verified Account
                  </Text>
                </View>
                )}
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 16 }} />

              <TouchableOpacity
                onPress={handleEditToggle}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "500",
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: "transparent",
                  color: colors.foreground,
                  height: 36,
                  paddingLeft: 12,
                  paddingRight: 12,
                  width: "100%",
                  marginBottom: 0,
                }}
              >
                <Icons.Settings style={{ height: 20, width: 20, marginRight: 8, color: colors.foreground }} />
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}>
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Text>
              </TouchableOpacity>

              <Animated.View
                style={{
                  maxHeight: isEditing ? 400 : 0,
                  opacity: isEditing ? 1 : 0,
                  overflow: "hidden",
                  marginTop: isEditing ? 16 : 0,
                  ...(Platform.OS === 'web'
                    ? { transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }
                    : {}),
                }}
              >
                <View style={{ flexDirection: "column", gap: 12 }}>
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        lineHeight: 16,
                        color: colors.foreground,
                        marginBottom: 4,
                      }}
                    >
                      Name
                    </Text>
                    <TextInput
                      value={editData.name}
                      onChangeText={(text) => {
                        setEditData({ ...editData, name: text })
                        // Clear success message when making changes
                        if (successMessage) setSuccessMessage(null)
                      }}
                      style={{
                        height: 44,
                        width: "100%",
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.input,
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingVertical: 10,
                        textAlignVertical: "center",
                        fontSize: 14,
                        marginBottom: 0,
                      }}
                      placeholder="Name"
                      placeholderTextColor={colors.mutedForeground}
                      underlineColorAndroid="transparent"
                     
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        lineHeight: 16,
                        color: colors.foreground,
                        marginBottom: 4,
                      }}
                    >
                      Email
                    </Text>
                    <TextInput
                      value={editData.email}
                      onChangeText={(text) => setEditData({ ...editData, email: text })}
                      style={{
                        height: 44,
                        width: "100%",
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.input,
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingVertical: 10,
                        textAlignVertical: "center",
                        fontSize: 14,
                        marginBottom: 0,
                      }}
                      placeholder="Email"
                      placeholderTextColor={colors.mutedForeground}
                      underlineColorAndroid="transparent"
                      onFocus={(e) => {
                        if (Platform.OS === 'web') {
                          e.currentTarget.style.borderColor = colors.ring
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.ring}33`
                        }
                      }}
                      onBlur={(e) => {
                        if (Platform.OS === 'web') {
                          e.currentTarget.style.borderColor = colors.input
                          e.currentTarget.style.boxShadow = "none"
                        }
                      }}
                    />
                  </View>
                  <Animated.View
                    style={{
                      opacity: passwordFieldOpacity,
                      height: passwordFieldHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 90] // Approximate height of the password field
                      }),
                      overflow: 'hidden',
                      marginTop: 4,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          lineHeight: 16,
                          color: colors.foreground,
                          marginBottom: 4,
                        }}
                      >
                        Password *
                      </Text>
                      <TextInput
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text)
                          // Clear success message when making changes
                          if (successMessage) setSuccessMessage(null)
                        }}
                        secureTextEntry
                        style={{
                          height: 44,
                          width: "100%",
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: colors.input,
                          backgroundColor: colors.background,
                          color: colors.foreground,
                          paddingLeft: 12,
                          paddingRight: 12,
                          paddingVertical: 10,
                          textAlignVertical: "center",
                          fontSize: 14,
                          marginBottom: 0,
                        }}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.mutedForeground}
                        underlineColorAndroid="transparent"
                      />
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>
                        Password required to update email
                      </Text>
                    </View>
                  </Animated.View>
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        lineHeight: 16,
                        color: colors.foreground,
                        marginBottom: 4,
                      }}
                    >
                      Role
                    </Text>
                    <TextInput
                      value={editData.role}
                      onChangeText={(text) => {
                        setEditData({ ...editData, role: text })
                        // Clear success message when making changes
                        if (successMessage) setSuccessMessage(null)
                      }}
                      style={{
                        height: 44,
                        width: "100%",
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.input,
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingVertical: 10,
                        textAlignVertical: "center",
                        fontSize: 14,
                        marginBottom: 0,
                      }}
                      placeholder="Role"
                      placeholderTextColor={colors.mutedForeground}
                      underlineColorAndroid="transparent"
                      onFocus={(e) => {
                        // Not directly supported in RN, would need to use state
                      }}
                      onBlur={(e) => {
                        // Not directly supported in RN, would need to use state
                      }}
                    />
                  </View>
                  {error && (
                    <View style={{ paddingVertical: 8 }}>
                      <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: "500" }}>
                        {error}
                      </Text>
                    </View>
                  )}
                  {successMessage && (
                    <View style={{ paddingVertical: 8 }}>
                      <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: "500" }}>
                        {successMessage}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, paddingTop: 8 }}>
                    <TouchableOpacity
                      onPress={handleSaveWithValidation}
                      disabled={loading}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "500",
                        backgroundColor: colors.primary,
                        color: colors.primaryForeground,
                        height: 36,
                        paddingLeft: 12,
                        paddingRight: 12,
                        borderWidth: 0,
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        // Simple loading indicator (you might want to replace this with a proper spinner)
                        <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: "500" }}>Saving...</Text>
                      ) : (
                        <>
                          <Icons.CheckCircle style={{ height: 22, width: 22, marginRight: 8, color: colors.primaryForeground }} />
                          <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: "500" }}>Save</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancel}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "500",
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: "transparent",
                        color: colors.foreground,
                        height: 36,
                        paddingLeft: 12,
                        paddingRight: 12,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </View>

        <View
          style={{
            ...(Platform.OS === 'web'
              ? { gridColumn: isMobile || isTablet ? "1" : "2" }
              : {}),
            flexDirection: "column",
            gap: isMobile ? 16 : 24,
            minWidth: 0,
            display: "flex",
          }}
        >
          {/* OAuth Integrations Card */}
          <View style={{
            // ...oauthCardAnimation, // removed animation
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "transparent",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.cardForeground,
                shadowOpacity: 0,
                // No backdropFilter in RN
                transition: "all 0.3s ease-in-out",
              }}
            >
              <View style={{ flexDirection: "column", gap: 6, padding: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icons.Zap style={{ height: 22, width: 20, color: colors.primary }} />
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "600",
                      lineHeight: 24,
                      letterSpacing: -0.4,
                      color: colors.cardForeground,
                    }}
                  >
                    OAuth Integrations
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                  Connect your accounts to enhance your development workflow
                </Text>
              </View>
              <View style={{ padding: 24, paddingTop: 0 }}>
                <View
                  style={{
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: `${colors.muted}33`,
                    borderWidth: 1,
                    borderColor: `${colors.border}66`,
                    gap: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Icons.Github style={{ height: 24, width: 24, color: colors.foreground }} />
                    <View>
                      <Text style={{ fontWeight: "500", color: colors.cardForeground, fontSize: 16 }}>GitHub Account</Text>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        {isGithubLinked ? "Connected" : "Not connected"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: "500",
                      backgroundColor: isGithubLinked ? colors.secondary : colors.primary,
                      color: isGithubLinked ? colors.secondaryForeground : colors.primaryForeground,
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      opacity: isGithubLinked ? 0.6 : 1,
                    }}
                    disabled={isGithubLinked}
                    onPress={!isGithubLinked ? () => {/* your link github logic here */} : undefined}
                    onMouseEnter={(e) => {
                      if (Platform.OS === 'web' && !isGithubLinked) {
                        e.currentTarget.style.opacity = "0.9"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (Platform.OS === 'web' && !isGithubLinked) {
                        e.currentTarget.style.opacity = "1"
                      }
                    }}
                  >
                    <Icons.Github style={{ height: 22, width: 22, marginRight: 8, color: isGithubLinked ? colors.secondaryForeground : colors.primaryForeground }} />
                    <Text style={{ color: isGithubLinked ? colors.secondaryForeground : colors.primaryForeground, fontSize: 14, fontWeight: "500" }}>
                      {isGithubLinked ? "Connected" : "Link GitHub"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* API Key Card */}
          <View style={{
            // ...tokenCardAnimation, // removed animation
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "transparent",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.cardForeground,
                shadowOpacity: 0,
                // No backdropFilter in RN
                transition: "all 0.3s ease-in-out",
              }}
            >
              <View style={{ flexDirection: "column", gap: 6, padding: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icons.Key style={{ height: 22, width: 22, color: colors.primary }} />
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "600",
                      lineHeight: 24,
                      letterSpacing: -0.4,
                      color: colors.cardForeground,
                    }}
                  >
                    API Key
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                  Manage your Gemini API key for AI features
                </Text>
              </View>
              <View
                style={{ padding: 24, paddingTop: 0, flexDirection: "column", gap: 16 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Text style={{ color: colors.mutedForeground, fontFamily: "monospace" }}>
                    Key: {apiKey ? `${apiKey.substring(0, 8)}...` : "Not set"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setTempApiKey(apiKey || "");
                      setShowApiKeyInput(true);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: "500",
                      backgroundColor: colors.primary,
                      color: colors.primaryForeground,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 6,
                      paddingBottom: 6,
                    }}
                  >
                    <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: "500" }}>
                      {apiKey ? "Change" : "Set Key"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Animated.View
                  style={{
                    opacity: apiKeyFieldOpacity,
                    height: apiKeyFieldHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 120] // Approximate height of the API key field
                    }),
                    overflow: 'hidden',
                    marginTop: 4,
                  }}
                >
                  <View style={{ flexDirection: "column", gap: 12 }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          lineHeight: 16,
                          color: colors.foreground,
                          marginBottom: 4,
                        }}
                      >
                        Gemini API Key
                      </Text>
                      <TextInput
                        value={tempApiKey}
                        onChangeText={setTempApiKey}
                        secureTextEntry
                        style={{
                          height: 44,
                          width: "100%",
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: colors.input,
                          backgroundColor: colors.background,
                          color: colors.foreground,
                          paddingLeft: 12,
                          paddingRight: 12,
                          paddingVertical: 10,
                          textAlignVertical: "center",
                          fontSize: 14,
                          marginBottom: 0,
                        }}
                        placeholder="Enter your Gemini API key"
                        placeholderTextColor={colors.mutedForeground}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={handleSaveApiKey}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: "500",
                          backgroundColor: colors.primary,
                          color: colors.primaryForeground,
                          height: 36,
                          paddingLeft: 12,
                          paddingRight: 12,
                        }}
                      >
                        <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: "500" }}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelApiKey}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: "500",
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: "transparent",
                          color: colors.foreground,
                          height: 36,
                          paddingLeft: 12,
                          paddingRight: 12,
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* API Usage Card */}
          <View style={{
            // ...usageCardAnimation, // removed animation
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "transparent",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.cardForeground,
                shadowOpacity: 0,
                transition: "all 0.3s ease-in-out",
              }}
            >
                              <View style={{ flexDirection: "column", gap: 6, padding: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icons.BarChart3 style={{ height: 20, width: 20, color: colors.primary }} />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "600",
                        lineHeight: 24,
                        letterSpacing: -0.4,
                        color: colors.cardForeground,
                      }}
                    >
                      GitHub API Usage
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                    {isGithubLinked ? "Track your current GitHub API usage and limits" : "Connect GitHub to view API usage"}
                  </Text>
                </View>
              <View
                style={{ padding: 24, paddingTop: 0, flexDirection: "column", gap: 16 }}
              >
                {!isGithubLinked ? (
                  <View style={{ 
                    flexDirection: "column", 
                    alignItems: "center", 
                    padding: 32,
                    gap: 16 
                  }}>
                    <Icons.Github style={{ height: 48, width: 48, color: colors.mutedForeground }} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 16, textAlign: "center" }}>
                      Connect your GitHub account to view API usage statistics
                    </Text>
                  </View>
                ) : !gitRateLimit ? (
                  <View style={{ 
                    flexDirection: "column", 
                    alignItems: "center", 
                    padding: 32,
                    gap: 16 
                  }}>
                    <Icons.BarChart3 style={{ height: 48, width: 48, color: colors.mutedForeground }} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 16, textAlign: "center" }}>
                      Loading API usage data...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 14 }}>
                      <Text style={{ color: colors.mutedForeground }}>GitHub API Requests</Text>
                      <Text style={{ fontWeight: "500", color: colors.cardForeground }}>
                        {apiUsage.toLocaleString()} / {apiLimit.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: "relative",
                        height: 16,
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: 9999,
                        backgroundColor: colors.secondary,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          backgroundColor: usagePercentage > 80 ? colors.destructive : colors.primary,
                          width: `${usagePercentage}%`,
                          ...(Platform.OS === 'web'
                            ? { transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }
                            : {}),
                          position: "absolute",
                          left: 0,
                          top: 0,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: colors.mutedForeground,
                      }}
                    >
                      <Text style={{color:theme.opposite}}>{(100 - usagePercentage).toFixed(1)}% remaining</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Icons.Clock2 style={{ height: 12, width: 12, color: colors.mutedForeground }} />
                        <Text 
                          style={{
                            color: theme.opposite,
                            fontSize: 12,
                            fontFamily: "monospace",
                            fontWeight: "600",
                          }}
                        >
                          {formatApiTime(apiTimeLeft)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {isGithubLinked && gitRateLimit && (
                  <View
                    style={{
                      flexDirection: isMobile ? "column" : "row",
                      gap: 16,
                      paddingTop: 8,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: `${colors.muted}66`,
                        flex: 1,
                      }}
                    >
                      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>
                        {gitRateLimit?.resources?.core?.remaining || 0}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Core remaining</Text>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: `${colors.muted}66`,
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: colors.accent === colors.secondary ? colors.primary : colors.accent,
                        }}
                      >
                        {gitRateLimit?.resources?.search?.remaining || 0}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Search remaining</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}