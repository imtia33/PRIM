import React from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"

export function AiCodeReviews() {
  // Using Tailwind colors from the CSS variables
  const colors = {
    background: "hsl(210, 11%, 7%)", // --background
    foreground: "hsl(160, 14%, 93%)", // --foreground
    muted: "hsl(240, 2%, 16%)", // --muted
    mutedForeground: "hsla(160, 14%, 93%, 0.7)", // --muted-foreground
    card: "hsla(220, 17%, 98%, 0.01)", // --card
    cardForeground: "hsl(160, 14%, 93%)", // --card-foreground
    popover: "hsl(210, 11%, 7%)", // --popover
    popoverForeground: "hsl(160, 14%, 93%)", // --popover-foreground
    primary: "hsl(165, 96%, 71%)", // --primary
    primaryForeground: "hsl(160, 8%, 6%)", // --primary-foreground
    primaryDark: "hsl(160, 100%, 50%)", // --primary-dark
    primaryLight: "hsl(160, 48%, 87%)", // --primary-light
    secondary: "hsl(160, 14%, 93%)", // --secondary
    secondaryForeground: "hsl(165, 14%, 8%)", // --secondary-foreground
    accent: "hsl(240, 2%, 25%)", // --accent
    accentForeground: "hsl(240, 2%, 96%)", // --accent-foreground
    border: "hsla(240, 100%, 100%, 0.08)", // --border
    borderLight: "hsla(210, 17%, 6%, 0.1)", // --border-light
    borderDark: "hsla(210, 17%, 6%, 0.05)", // --border-dark
    ring: "hsl(165, 96%, 71%)", // --ring
  }

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "transparent",
      }}
      accessibilityRole="image"
      accessibilityLabel="AI Code Reviews interface showing code suggestions with apply buttons"
    >
      {/* Background Message Box (Blurred) */}
      <View
        style={{
          position: "absolute",
          top: 30,
          left: "50%",
          transform: [{ translateX: -170 }, { scale: 0.9 }], // Adjusted translateX to match width/2
          width: 340,
          height: 205.949,
          backgroundColor: colors.card, // Using card color
          opacity: 0.6,
          borderRadius: 8.826,
          borderWidth: 0.791,
          borderColor: colors.border, // Using border color
          overflow: "hidden",
        }}
      >
        <View
          style={[styles.card, { padding: 7.355, height: "100%" }]}
        >
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground, // Using muted foreground color
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`switch (type) {`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` case 'success':`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` return {`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`          border: theme === 'dark' ? 'border-[rgba(34,197,94,0.4)]' : 'border-green-200',`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` icon: (`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`            <svg className={'baseIconClasses'} fill="none" viewBox="0 0 14 14">`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` &lt;path`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`                d="M3.85156 7.875L6.47656 10.5L10.8516 3.5"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`                stroke="var(--ai-primary-color)"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`                strokeLinecap="round"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`                strokeLinejoin="round"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {`                strokeWidth="1.5"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` /&gt;`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 9.562,
              lineHeight: 14.711,
              letterSpacing: -0.2942,
              color: colors.mutedForeground,
              width: "100%",
              maxWidth: 320,
              margin: 0,
            }}
          >
            {` &lt;/svg&gt;`}
          </Text>
        </View>
      </View>

      {/* Foreground Message Box (Main) */}
      <View
        style={{
          position: "absolute",
          top: 51.336,
          left: "50%",
          transform: [{ translateX: -170 }], // Adjusted translateX to match width/2
          width: 340,
          height: 221.395,
          backgroundColor: colors.background, // Using background color
          borderRadius: 9.488,
          borderWidth: 1,
          borderColor: colors.borderLight, // Using border light color
          overflow: "hidden",
        }}
      >
        <View
          style={[styles.card, { padding: 9.488, height: "100%", position: "relative" }]}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              width: "100%",
              top: 47.67,
              height: 33.118,
              backgroundColor: "hsla(160, 14%, 93%, 0.08)", // foreground with opacity
              zIndex: 1,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              width: "100%",
              top: 80.791,
              height: 45.465,
              backgroundColor: "hsla(165, 96%, 71%, 0.12)", // primary with opacity
              zIndex: 1,
            }}
          />
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground, // Using foreground color
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`switch (type) {`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` case 'success':`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` return {`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`          border: theme === 'dark' ? 'border-[rgba(34,197,94,0.4)]' : 'border-green-200',`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` icon: (`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`            <svg className={'baseIconClasses'} fill="none" viewBox="0 0 14 14">`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` &lt;path`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`                d="M3.85156 7.875L6.47656 10.5L10.8516 3.5"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: "#22C55E", // Green stroke (kept as is for visual effect)
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`                stroke="#22C55E"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`                strokeLinecap="round"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`                strokeLinejoin="round"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {`                strokeWidth="1.5"`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` /&gt;`}
          </Text>
          <Text
            style={{
              fontFamily: "monospace",
              fontSize: 10.279,
              lineHeight: 15.814,
              letterSpacing: -0.3163,
              color: colors.foreground,
              width: "100%",
              maxWidth: 320,
              position: "relative",
              zIndex: 2,
              margin: 0,
            }}
          >
            {` &lt;/svg&gt;`}
          </Text>
          <Pressable
            style={{
              position: "absolute",
              top: "65%", // Adjusted position
              right: 20,
              zIndex: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 3.953,
              backgroundColor: colors.primary, // Using primary color
              borderWidth: 0,
              paddingVertical: 3.163,
              paddingHorizontal: 6.326,
              borderRadius: 5.535,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontFamily: "system font",
                fontWeight: "500",
                color: colors.primaryForeground, // Using primary foreground color
                fontSize: 10.279,
                lineHeight: 15.814,
                letterSpacing: -0.3163,
              }}
            >
              {"See suggestion"}
            </Text>
            <Text
              style={{
                fontFamily: "system font",
                fontWeight: "500",
                color: colors.primaryForeground, // Using primary foreground color
                fontSize: 10.279,
                lineHeight: 15.814,
                letterSpacing: -0.3163,
              }}
            >
              ⌘Y
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: "hsl(210, 11%, 7%)", // Dark background
    borderWidth: 1,
    borderColor: "hsla(240, 100%, 100%, 0.08)", // Border with opacity
  },
})