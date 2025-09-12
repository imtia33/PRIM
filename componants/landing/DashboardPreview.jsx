import React from "react"
import { Image, Dimensions } from "react-native"

export function DashboardPreview() {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = Math.min(screenWidth - 32, 1160);
  const imageWidth = containerWidth - 16; // Account for padding
  const imageHeight = (imageWidth * 700) / 1140; // Maintain aspect ratio

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-[calc(100vw-32px)] md:w-[1160px]" style={{ 
        position: 'relative', 
        zIndex: 1,
        isolation: 'isolate' // Creates a new stacking context
      }}>
        <div className="bg-primary-light/50 rounded-2xl p-2" style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          zIndex: 1,
          transform: 'translateZ(0)' // Forces hardware acceleration and proper layering
        }}>
          <Image
            source={{ uri: "/images/dashboard-preview.png" }}
            alt="Dashboard preview"
            style={{
              width: imageWidth,
              height: imageHeight,
              borderRadius: 12,
              position: 'relative',
              zIndex: 1,
              // Completely removed React Native shadow properties to avoid conflicts
            }}
            resizeMode="cover"
          />
        </div>
      </div>
    </div>
  )
}