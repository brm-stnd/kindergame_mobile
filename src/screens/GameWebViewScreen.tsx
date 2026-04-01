import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

const PRIMARY = '#2DBCAF';

// Games that should be fullscreen landscape
const FULLSCREEN_GAMES = ['maze-game', 'labirin'];

export default function GameWebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(route.params?.title || 'Game');

  const gameUrl = route.params?.url || 'https://kindergame.id';
  
  // Check if this is a fullscreen game (like maze)
  const isFullscreenGame = FULLSCREEN_GAMES.some(slug => gameUrl.includes(slug));

  useEffect(() => {
    if (isFullscreenGame) {
      // Lock to landscape for maze game
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      StatusBar.setHidden(true);
    }

    return () => {
      // Reset orientation when leaving
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    };
  }, [isFullscreenGame]);

  // Fullscreen mode for maze game
  if (isFullscreenGame) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Memuat game...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: gameUrl }}
          style={styles.fullscreenWebView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          injectedJavaScript={`
            (function() {
              // Hide all navigation for fullscreen experience
              var style = document.createElement('style');
              style.innerHTML = \`
                header, nav, .bottom-nav, [class*="BottomNav"], [class*="AppHeader"], 
                [class*="header"], [class*="Header"], footer, .footer {
                  display: none !important;
                }
                body, html {
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: hidden !important;
                }
                #root, .game-container, [class*="game"], main {
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: none !important;
                }
              \`;
              document.head.appendChild(style);
              true;
            })();
          `}
        />
      </View>
    );
  }

  // Normal game mode - NO header (game has its own header)
  return (
    <View style={styles.container}>
      {/* WebView - fullscreen without app header */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Memuat game...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: gameUrl }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(navState) => {
            if (navState.title && navState.title !== title) {
              setTitle(navState.title);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Inject CSS for seamless mobile experience
          injectedJavaScript={`
            (function() {
              var style = document.createElement('style');
              style.innerHTML = \`
                /* Hide ALL navigation elements */
                header, nav, footer,
                [class*="BottomNav"], [class*="bottom-nav"],
                [class*="AppHeader"], [class*="Header"],
                [class*="NavBar"], [class*="navbar"] {
                  display: none !important;
                  visibility: hidden !important;
                  height: 0 !important;
                  overflow: hidden !important;
                }
                
                /* Reset body padding */
                body, html {
                  padding: 0 !important;
                  margin: 0 !important;
                  min-height: 100vh !important;
                  overflow-x: hidden !important;
                }
                
                /* Game wrapper full height */
                #root > div:first-child,
                [class*="PageWrapper"],
                [class*="Wrapper"],
                [class*="Container"] {
                  padding-bottom: 0 !important;
                  min-height: 100vh !important;
                }
                
                /* Intro overlay - ensure it covers everything */
                [class*="IntroOverlay"],
                [class*="Overlay"] {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  bottom: 0 !important;
                  padding-top: env(safe-area-inset-top, 20px) !important;
                  padding-bottom: env(safe-area-inset-bottom, 20px) !important;
                }
                
                /* Intro wrapper - center content vertically */
                [class*="IntroWrapper"] {
                  min-height: 100vh !important;
                  min-height: 100dvh !important;
                  padding-bottom: 100px !important;
                  justify-content: center !important;
                }
                
                /* Start button - position at bottom */
                button[class*="StartBtn"],
                [class*="StartBtn"],
                button:contains("Mulai") {
                  position: fixed !important;
                  bottom: 40px !important;
                  left: 16px !important;
                  right: 16px !important;
                  width: calc(100% - 32px) !important;
                  max-width: 480px !important;
                  margin: 0 auto !important;
                  z-index: 9999 !important;
                }
                
                /* Game area full screen */
                [class*="GameWrap"],
                [class*="GameArea"],
                [class*="game-container"] {
                  min-height: 100vh !important;
                  padding-bottom: 20px !important;
                }
              \`;
              document.head.appendChild(style);
              
              // Also try to find and relocate start buttons via JS
              setTimeout(function() {
                var btns = document.querySelectorAll('button');
                btns.forEach(function(btn) {
                  if (btn.textContent && btn.textContent.includes('Mulai')) {
                    btn.style.cssText = 'position:fixed !important; bottom:40px !important; left:16px !important; right:16px !important; width:calc(100% - 32px) !important; max-width:480px !important; margin:0 auto !important; z-index:9999 !important;';
                  }
                });
              }, 500);
              
              true;
            })();
          `}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  reloadBtn: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  fullscreenWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },

});
