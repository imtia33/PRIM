import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {  useEffect } from 'react';
import '../global.css';
import {ThemeProvider} from '../context/ColorMode';
import AppwriteProvider from '../context/appwriteContext'

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
  "cc-bold": require("../assets/fonts/CascadiaCode-Bold.ttf"),
  "cc-bold-italic": require("../assets/fonts/CascadiaCode-BoldItalic.ttf"),
  "cc-extralight": require("../assets/fonts/CascadiaCode-ExtraLight.ttf"),
  "cc-extralight-italic": require("../assets/fonts/CascadiaCode-ExtraLightItalic.ttf"),
  "cc-italic": require("../assets/fonts/CascadiaCode-Italic.ttf"),
  "cc-light": require("../assets/fonts/CascadiaCode-Light.ttf"),
  "cc-light-italic": require("../assets/fonts/CascadiaCode-LightItalic.ttf"),
  "cc-medium": require("../assets/fonts/CascadiaCode-Medium.ttf"),
  "cc-medium-italic": require("../assets/fonts/CascadiaCode-MediumItalic.ttf"),
  "cc-regular": require("../assets/fonts/CascadiaCode-Regular.ttf"),
  "cc-semibold": require("../assets/fonts/CascadiaCode-SemiBold.ttf"),
  "cc-semibold-italic": require("../assets/fonts/CascadiaCode-SemiBoldItalic.ttf"),
});



  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    } else {
      SplashScreen.preventAutoHideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppwriteProvider>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="intro"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="oauth-redirect"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens"
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Test"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CodeBlockExample"
        options={{
          headerShown: false,
        }}
      />
      
    </Stack>
   
    </AppwriteProvider>

    </ThemeProvider>
  );
}
