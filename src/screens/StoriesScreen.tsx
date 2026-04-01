import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Play, Heart, Sparkles } from 'lucide-react-native';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  published: string;
}

export default function StoriesScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetch(`${API_BASE}/api/dongeng/videos`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.videos?.length) {
          setVideos(d.videos);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setPlaying(false);
  };

  const handlePlay = () => setPlaying(true);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Memuat dongeng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || videos.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.loadingText}>Gagal memuat video. Coba lagi nanti.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hero = videos[activeIdx];
  const listVideos = videos.filter((_, i) => i !== activeIdx);
  const visible = listVideos.slice(0, visibleCount);
  const hasMore = visibleCount < listVideos.length;

  // Just use YouTube watch URL directly - more reliable
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${hero.id}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Player */}
        <View style={styles.heroWrap}>
          {playing ? (
            <View style={styles.iframeWrap}>
              <WebView
                source={{ uri: youtubeWatchUrl }}
                style={styles.webview}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.heroThumb} onPress={handlePlay} activeOpacity={0.9}>
              <Image 
                source={{ uri: hero.thumbnail }} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroOverlay}>
                {activeIdx === 0 && (
                  <View style={styles.newBadge}>
                    <Sparkles size={10} color="#fff" />
                    <Text style={styles.newBadgeText}>TERBARU</Text>
                  </View>
                )}
                <Text style={styles.heroTitle}>{hero.title}</Text>
              </View>
              <View style={styles.playBtn}>
                <Play size={32} color="#fff" fill="#fff" />
              </View>
              <TouchableOpacity style={styles.heartBtn}>
                <Heart size={20} color="#94a3b8" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>

        {/* Video List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selanjutnya <Text style={{ color: PRIMARY }}>✦</Text></Text>
          
          {visible.map((v) => {
            const realIdx = videos.findIndex(x => x.id === v.id);
            return (
              <TouchableOpacity
                key={v.id}
                style={styles.videoRow}
                onPress={() => handleSelect(realIdx)}
                activeOpacity={0.8}
              >
                <View style={styles.vThumb}>
                  <Image source={{ uri: v.thumbnail }} style={styles.vThumbImage} />
                  <View style={styles.vThumbPlay}>
                    <Play size={22} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.9)" />
                  </View>
                </View>
                <View style={styles.vMeta}>
                  <Text style={styles.vTitle} numberOfLines={2}>{v.title}</Text>
                  <View style={styles.vTag}>
                    <Text style={styles.vTagText}>Dongeng</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.rowHeart}>
                  <Heart size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => setVisibleCount(c => c + 5)}
            >
              <Text style={styles.loadMoreText}>
                Tampilkan {Math.min(5, listVideos.length - visibleCount)} video lagi ↓
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f8',
  },
  scroll: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  errorIcon: {
    fontSize: 40,
  },
  // Hero
  heroWrap: {
    backgroundColor: '#f6f8f8',
    width: '100%',
  },
  heroThumb: {
    width: '100%',
    aspectRatio: 9/16,
    position: 'relative',
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 60,
    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(45,188,175,0.88)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  iframeWrap: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  // List
  section: {
    padding: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 10,
  },
  vThumb: {
    width: 68,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  vThumbImage: {
    width: '100%',
    height: '100%',
  },
  vThumbPlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  vMeta: {
    flex: 1,
  },
  vTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 18,
    marginBottom: 5,
  },
  vTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,188,175,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  vTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: PRIMARY,
  },
  rowHeart: {
    padding: 4,
  },
  loadMoreBtn: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
});
