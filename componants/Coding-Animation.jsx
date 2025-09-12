import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";

const codeLines = [
  // Line 1
  [
    { width: 70.4, color: "rgb(120, 252, 214)", delay: 500 },
    { width: 12.8, color: "rgb(231, 236, 235)", delay: 575 },
  ],
  // Line 2 (indented)
  [
    { width: 80, color: "rgb(195, 229, 219)", delay: 650, indent: 16 },
    { width: 25.6, color: "rgb(195, 229, 219)", delay: 725 },
    { width: 44.8, color: "rgb(120, 252, 214)", delay: 800 },
    { width: 38.4, color: "rgb(0, 255, 182)", delay: 875 },
    { width: 70.4, color: "rgb(120, 252, 214)", delay: 950 },
    { width: 25.6, color: "rgb(195, 229, 219)", delay: 1025 },
    { width: 25.6, color: "rgb(195, 229, 219)", delay: 1100 },
  ],
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 1175 }],
  // Empty line
  [],
  // Line 5
  [
    { width: 76.8, color: "rgb(120, 252, 214)", delay: 1250 },
    { width: 12.8, color: "rgb(231, 236, 235)", delay: 1325 },
  ],
  // Line 6 (indented)
  [{ width: 38.4, color: "rgb(0, 255, 182)", delay: 1400, indent: 16 }],
  // Line 7 (indented)
  [{ width: 44.8, color: "rgb(195, 229, 219)", delay: 1475, indent: 16 }],
  // Line 8 (indented)
  [
    { width: 64, color: "rgb(195, 229, 219)", delay: 1550, indent: 16 },
    { width: 38.4, color: "rgb(0, 255, 182)", delay: 1625 },
    { width: 73.6, color: "rgb(195, 229, 219)", delay: 1700 },
  ],
  // Line 9
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 1775 }],
  // Empty line
  [],
  // Line 11
  [
    { width: 51.2, color: "rgb(120, 252, 214)", delay: 1850 },
    { width: 12.8, color: "rgb(231, 236, 235)", delay: 1925 },
  ],
  // Line 12 (indented)
  [
    { width: 44.8, color: "rgb(120, 252, 214)", delay: 2000, indent: 16 },
    { width: 32, color: "rgb(195, 229, 219)", delay: 2075 },
    { width: 19.2, color: "rgb(120, 252, 214)", delay: 2150 },
    { width: 57.6, color: "rgb(120, 252, 214)", delay: 2225 },
    { width: 105.6, color: "rgb(195, 229, 219)", delay: 2300 },
    { width: 38.4, color: "rgb(0, 255, 182)", delay: 2375 },
  ],
  // Line 13 (indented)
  [
    { width: 60, color: "rgb(195, 229, 219)", delay: 2450, indent: 16 },
    { width: 30, color: "rgb(120, 252, 214)", delay: 2525 },
    { width: 45, color: "rgb(244, 244, 245)", delay: 2600 },
  ],
  // Line 14 (indented)
  [
    { width: 55, color: "rgb(0, 255, 182)", delay: 2675, indent: 16 },
    { width: 40, color: "rgb(195, 229, 219)", delay: 2750 },
    { width: 35, color: "rgb(120, 252, 214)", delay: 2825 },
    { width: 50, color: "rgb(120, 252, 214)", delay: 2900 },
  ],
  // Line 15
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 2975 }],
  // Empty line
  [],
  // Line 17
  [
    { width: 85, color: "rgb(120, 252, 214)", delay: 3050 },
    { width: 15, color: "rgb(231, 236, 235)", delay: 3125 },
  ],
  // Line 18 (indented)
  [
    { width: 65, color: "rgb(120, 252, 214)", delay: 3200, indent: 16 },
    { width: 45, color: "rgb(195, 229, 219)", delay: 3275 },
    { width: 25, color: "rgb(0, 255, 182)", delay: 3350 },
  ],
  // Line 19 (indented)
  [
    { width: 70, color: "rgb(195, 229, 219)", delay: 3425, indent: 16 },
    { width: 30, color: "rgb(120, 252, 214)", delay: 3500 },
    { width: 55, color: "rgb(244, 244, 245)", delay: 3575 },
    { width: 40, color: "rgb(0, 255, 182)", delay: 3650 },
  ],
  // Line 20 (indented)
  [
    { width: 50, color: "rgb(120, 252, 214)", delay: 3725, indent: 16 },
    { width: 35, color: "rgb(195, 229, 219)", delay: 3800 },
    { width: 60, color: "rgb(120, 252, 214)", delay: 3875 },
  ],
  // Line 21 (indented)
  [
    { width: 75, color: "rgb(0, 255, 182)", delay: 3950, indent: 16 },
    { width: 20, color: "rgb(231, 236, 235)", delay: 4025 },
    { width: 45, color: "rgb(195, 229, 219)", delay: 4100 },
  ],
  // Line 22
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 4175 }],
  // Empty line
  [],
  // Line 24
  [
    { width: 90, color: "rgb(120, 252, 214)", delay: 4250 },
    { width: 18, color: "rgb(231, 236, 235)", delay: 4325 },
  ],
  // Line 25 (indented)
  [
    { width: 55, color: "rgb(120, 252, 214)", delay: 4400, indent: 16 },
    { width: 40, color: "rgb(195, 229, 219)", delay: 4475 },
    { width: 30, color: "rgb(0, 255, 182)", delay: 4550 },
    { width: 65, color: "rgb(244, 244, 245)", delay: 4625 },
  ],
  // Line 26 (indented)
  [
    { width: 80, color: "rgb(195, 229, 219)", delay: 4700, indent: 16 },
    { width: 25, color: "rgb(120, 252, 214)", delay: 4775 },
    { width: 50, color: "rgb(120, 252, 214)", delay: 4850 },
  ],
  // Line 27 (indented)
  [
    { width: 45, color: "rgb(0, 255, 182)", delay: 4925, indent: 16 },
    { width: 35, color: "rgb(195, 229, 219)", delay: 5000 },
    { width: 60, color: "rgb(120, 252, 214)", delay: 5075 },
    { width: 40, color: "rgb(244, 244, 245)", delay: 5150 },
  ],
  // Line 28 (indented)
  [
    { width: 70, color: "rgb(120, 252, 214)", delay: 5225, indent: 16 },
    { width: 30, color: "rgb(231, 236, 235)", delay: 5300 },
    { width: 55, color: "rgb(195, 229, 219)", delay: 5375 },
  ],
  // Line 29 (indented)
  [
    { width: 85, color: "rgb(120, 252, 214)", delay: 5450, indent: 16 },
    { width: 20, color: "rgb(0, 255, 182)", delay: 5525 },
    { width: 45, color: "rgb(244, 244, 245)", delay: 5600 },
  ],
  // Line 30
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 5675 }],
  // Empty line
  [],
  // Line 32
  [
    { width: 95, color: "rgb(120, 252, 214)", delay: 5750 },
    { width: 22, color: "rgb(231, 236, 235)", delay: 5825 },
  ],
  // Line 33 (indented)
  [
    { width: 60, color: "rgb(120, 252, 214)", delay: 5900, indent: 16 },
    { width: 50, color: "rgb(195, 229, 219)", delay: 5975 },
    { width: 35, color: "rgb(0, 255, 182)", delay: 6050 },
  ],
  // Line 34 (indented)
  [
    { width: 75, color: "rgb(195, 229, 219)", delay: 6125, indent: 16 },
    { width: 40, color: "rgb(120, 252, 214)", delay: 6200 },
    { width: 55, color: "rgb(244, 244, 245)", delay: 6275 },
  ],
  // Line 35 (indented)
  [
    { width: 50, color: "rgb(120, 252, 214)", delay: 6350, indent: 16 },
    { width: 30, color: "rgb(231, 236, 235)", delay: 6425 },
    { width: 65, color: "rgb(195, 229, 219)", delay: 6500 },
    { width: 25, color: "rgb(0, 255, 182)", delay: 6575 },
  ],
  // Line 36
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 6650 }],
  // Empty line
  [],
  // Line 38
  [
    { width: 100, color: "rgb(120, 252, 214)", delay: 6725 },
    { width: 15, color: "rgb(231, 236, 235)", delay: 6800 },
  ],
  // Line 39 (indented)
  [
    { width: 80, color: "rgb(120, 252, 214)", delay: 6875, indent: 16 },
    { width: 45, color: "rgb(195, 229, 219)", delay: 6950 },
    { width: 30, color: "rgb(0, 255, 182)", delay: 7025 },
  ],
  // Line 40
  [{ width: 12.8, color: "rgb(231, 236, 235)", delay: 7100 }],
];

function CodeScrollAnimation({ isAnimating, scrollDistance, scrollSpeed }) {
  const translateYAnim = useRef(new Animated.Value(0)).current;
  
  // Create refs for all block animations
  const blockAnimations = useRef([]);
  
  // Initialize block animations
  if (blockAnimations.current.length === 0) {
    let index = 0;
    codeLines.forEach((line, lineIndex) => {
      line.forEach((block, blockIndex) => {
        blockAnimations.current[index] = new Animated.Value(0);
        index++;
      });
    });
  }
  
  useEffect(() => {
    if (isAnimating) {
      // Reset scroll position
      translateYAnim.setValue(0);
      
      blockAnimations.current.forEach(anim => {
        anim.setValue(0);
      });
      
      // Start scroll animation
      Animated.timing(translateYAnim, {
        toValue: scrollDistance,
        duration: scrollSpeed,
        easing: Easing.linear,
        useNativeDriver: true,
        delay: 1250,
      }).start();
      
      // Start block animations
      let index = 0;
      codeLines.forEach((line) => {
        line.forEach((block) => {
          if (block) {
            Animated.timing(blockAnimations.current[index], {
              toValue: 1,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
              delay: block.delay,
            }).start();
          }
          index++;
        });
      });
    }
  }, [isAnimating, scrollDistance, scrollSpeed]);

  return (
    <Animated.View 
      style={[
        styles.codeContainer,
        {
          transform: [{ translateY: translateYAnim }],
        }
      ]}
    >
      {codeLines.map((line, lineIndex) => {
        
        
        return (
          <View
            key={lineIndex}
            style={[
              styles.codeLine,
              {
                paddingLeft:  0,
                height: 18,
              }
            ]}
          >
            {line.map((block, blockIndex) => {
              let index = 0;
              for (let i = 0; i < lineIndex; i++) {
                index += codeLines[i].length;
              }
              index += blockIndex;
              
              const scaleAnim = blockAnimations.current[index] || new Animated.Value(0);
              
              return (
                <Animated.View
                  key={blockIndex}
                  style={[
                    styles.codeBlock,
                    {
                      marginRight: 6,
                      height: 12,
                      width: block.width,
                      backgroundColor: block.color,
                      transform: [{ scaleX: scaleAnim }],
                    }
                  ]}
                />
              );
            })}
          </View>
        );
      })}
    </Animated.View>
  );
}

export default function CodingAnimation({
  onComplete,
  autoLoop = false,
  showControls = true,
  style = {},
  label=""
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);
  const scrollDistance = -525;
  const scrollSpeed = 6000;

  // Reset animation when component mounts
  useEffect(() => {
    // Small delay before starting animation to ensure layout is complete
    const timer = setTimeout(() => setIsAnimating(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const totalDuration = scrollSpeed + 2000; // Animation duration + buffer
      const timer = setTimeout(() => {
        setAnimationCount((prev) => prev + 1);
        onComplete?.();

        if (autoLoop) {
          setIsAnimating(false);
          setTimeout(() => setIsAnimating(true), 500);
        }
      }, totalDuration);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, scrollSpeed, onComplete, autoLoop]);

  const restartAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 200);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.editorContainer}>
        <View style={styles.editorPanel}>
          {/* Browser Header */}
          <View style={styles.browserHeader}>
            <View style={styles.windowControls}>
              <View style={[styles.windowControl, styles.closeButton]} />
              <View style={[styles.windowControl, styles.minimizeButton]} />
              <View style={[styles.windowControl, styles.maximizeButton]} />
            </View>
            <Text style={styles.fileName}>{label}</Text>
          </View>

          {/* Code Content */}
          <View style={styles.codeContent}>
              <CodeScrollAnimation 
                isAnimating={isAnimating} 
                scrollDistance={scrollDistance}
                scrollSpeed={scrollSpeed}
              />
          </View>
        </View>

        
      </View>
    </View>
  );
}

// SVG Icon component for the restart button
const SvgIcon = () => (
  <Svg height="16" width="16" viewBox="0 0 16 16">
    <Path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" fill="rgb(231, 236, 235)" />
    <Path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" fill="rgb(231, 236, 235)" />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
    padding: 32,
    borderRadius: 8,
    backgroundColor: 'transparent',
    position:'absolute',
    alignSelf:'center',
    top:'35%'
  },
  editorContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  editorPanel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'column',
    borderRadius: 8,
    backgroundColor: 'rgb(15, 18, 17)', // --background
    borderWidth: 2,
    borderColor: 'rgb(120, 252, 214)', // --primary
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: 320,
    overflow: 'hidden',
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    height: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'rgb(15, 18, 17)', // --background
    zIndex: 20,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    left: 0,
  },
  windowControl: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  closeButton: {
    backgroundColor: 'rgb(255, 90, 90)', // red-500
    borderColor: 'rgb(255, 90, 90)', // red-500
  },
  minimizeButton: {
    backgroundColor: 'rgb(45, 120, 255)', // blue-600
    borderColor: 'rgb(45, 120, 255)', // blue-600
  },
  maximizeButton: {
    backgroundColor: 'rgb(0, 230, 220)', // teal-600
    borderColor: 'rgb(0, 230, 220)', // teal-600
  },
  fileName: {
    fontSize: 14,
    color: 'rgb(231, 236, 235)', // --muted-foreground
    flex: 1,
    textAlign: 'center',
  },
  codeContent: {
    width: '100%',
    minHeight: 0,
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    backgroundColor: 'rgb(15, 18, 17)', // --background
  },
  codeWrapper: {
    fontFamily: 'monospace',
    fontSize: 14,
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
    backgroundColor: 'rgb(15, 18, 17)', // --background
    left:5

  },
  codeContainer: {
    flexDirection: 'column',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(15, 18, 17)', // --background
    padding: 0,
    margin: 0,
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
    marginLeft: 0,
    paddingLeft: 0,
    backgroundColor: 'rgb(15, 18, 17)', // --background
  },
  codeBlock: {
    borderRadius: 4,
    opacity: 0.8,
    transformOrigin: 'left',
  },
  restartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    height: 32,
    width: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(15, 18, 17, 0.8)', // --background with opacity as rgba
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
