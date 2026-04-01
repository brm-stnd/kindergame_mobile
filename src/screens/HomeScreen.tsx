import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  Crown, Calendar, TrendingUp, Heart, Play,
  LayoutGrid, ListOrdered, Palette, Cat, Boxes, 
  BookA, Sparkles, Languages, Lightbulb, Car, PaintBucket,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import GameCard from '../components/GameCard';

const { width } = Dimensions.get('window');
const API_BASE = 'https://kindergame.id';
const PRIMARY = '#2DBCAF';

interface Game {
  _id: string;
  name: string;
  slug: string;
  image: string;
  path: string;
  premium: boolean;
  isNew?: boolean;
  categories: Array<{ _id: string; name: string; slug: string }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  bgColor?: string;
  iconColor?: string;
}

interface DongengVideo {
  id: string;
  title: string;
  thumbnail: string;
  published: string;
}

const ICON_MAP: Record<string, any> = {
  grid_view: LayoutGrid,
  calculate: ListOrdered,
  palette: PaintBucket,
  pets: Cat,
  shapes: Boxes,
  abc: BookA,
  auto_awesome: Sparkles,
  language: Languages,
  lightbulb: Lightbulb,
  directions_car: Car,
  draw: Palette,
};

const ALL_CATEGORY: Category = {
  _id: 'semua',
  name: 'Semua',
  slug: 'semua',
  icon: 'grid_view',
  bgColor: '#f3e8ff',
  iconColor: '#9333ea',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dongengVideos, setDongengVideos] = useState<DongengVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState('semua');

  const isPremium = user?.subscription?.status === 'active' && 
    user?.subscription?.endDate && 
    new Date(user.subscription.endDate) > new Date();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, catsRes, dongengRes] = await Promise.all([
        fetch(`${API_BASE}/api/games`),
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/dongeng/videos`),
      ]);

      const [gamesData, catsData, dongengData] = await Promise.all([
        gamesRes.json(),
        catsRes.json(),
        dongengRes.json(),
      ]);

      if (Array.isArray(gamesData)) setGames(gamesData);
      if (Array.isArray(catsData)) setCategories(catsData.filter((c: Category) => c.slug !== 'semua'));
      if (dongengData.ok && dongengData.videos?.length) {
        setDongengVideos(dongengData.videos.slice(0, 4));
      }
    } catch (error) {
      console.log('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = [ALL_CATEGORY, ...categories];

  const filteredGames = activeCategoryId === 'semua'
    ? games
    : games.filter(g => g.categories?.some(c => c._id === activeCategoryId));

  const getCategoryIcon = (iconName: string, color: string) => {
    const IconComponent = ICON_MAP[iconName] || LayoutGrid;
    return <IconComponent size={28} color={color} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          {isPremium && (
            <View style={styles.crownBadge}>
              <Crown size={16} color="#F59E0B" fill="#F59E0B" />
            </View>
          )}
        </View>

        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={require('../../assets/images/hero-banner.png')}
            style={styles.heroBg}
            imageStyle={styles.heroBgImage}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Main & Belajar Jadi Lebih Seru!</Text>
              <Text style={styles.heroSubtitle}>
                Platform edukasi interaktif untuk tumbuh kembang anak yang menyenangkan.
              </Text>
              <TouchableOpacity style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Mulai Main Sekarang</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Tumbuh Kembang Shortcuts */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.shortcutsScroll}
          contentContainerStyle={styles.shortcutsContent}
        >
          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('Tumbuh')}
          >
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={9} color="#fff" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
            <View style={[styles.shortcutIcon, { backgroundColor: PRIMARY }]}>
              <Calendar size={22} color="#fff" />
            </View>
            <View style={styles.shortcutInfo}>
              <Text style={styles.shortcutTitle}>Agenda Stimulasi</Text>
              <Text style={styles.shortcutDesc}>Aktivitas harian</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('Tumbuh')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#3B82F6' }]}>
              <TrendingUp size={22} color="#fff" />
            </View>
            <View style={styles.shortcutInfo}>
              <Text style={styles.shortcutTitle}>Grafik Pertumbuhan</Text>
              <Text style={styles.shortcutDesc}>Tracking TB & BB</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('Tumbuh')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.materialIcon}>💉</Text>
            </View>
            <View style={styles.shortcutInfo}>
              <Text style={styles.shortcutTitle}>Checklist Imunisasi</Text>
              <Text style={styles.shortcutDesc}>Jadwal vaksin anak</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('Tumbuh')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.materialIcon}>🍽️</Text>
            </View>
            <View style={styles.shortcutInfo}>
              <Text style={styles.shortcutTitle}>Panduan MPASI</Text>
              <Text style={styles.shortcutDesc}>Menu 6 bln - 2 thn</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {allCategories.map(cat => {
            const isActive = activeCategoryId === cat._id;
            return (
              <TouchableOpacity 
                key={cat._id}
                style={styles.categoryBtn}
                onPress={() => setActiveCategoryId(cat._id)}
              >
                <View style={[
                  styles.categoryIconBox, 
                  { backgroundColor: cat.bgColor || '#f1f5f9' },
                  isActive && styles.categoryIconBoxActive
                ]}>
                  {getCategoryIcon(cat.icon || 'grid_view', cat.iconColor || '#64748b')}
                </View>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Game Edukasi 🎮</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Game')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.gamesGrid}>
              {filteredGames.slice(0, 6).map((game, index) => (
                <GameCard 
                  key={game._id} 
                  game={game} 
                  isNew={index < 3}
                />
              ))}
            </View>
          )}
        </View>

        {/* Dongeng Section */}
        {dongengVideos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dongeng Anak 📚</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Dongeng')}>
                <Text style={styles.seeAll}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dongengScroll}
            >
              {dongengVideos.map(video => (
                <TouchableOpacity 
                  key={video.id} 
                  style={styles.dongengCard}
                  onPress={() => navigation.navigate('GameWebView', {
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    title: video.title,
                  })}
                >
                  <Image 
                    source={{ uri: video.thumbnail }} 
                    style={styles.dongengThumb}
                  />
                  <View style={styles.playOverlay}>
                    <View style={styles.playBtn}>
                      <Play size={20} color="#fff" fill="#fff" />
                    </View>
                  </View>
                  <View style={styles.heartBtn}>
                    <Heart size={16} color="#fff" />
                  </View>
                  <View style={styles.dongengInfo}>
                    <Text style={styles.dongengTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{games.length}</Text>
            <Text style={styles.statLabel}>GAME</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{categories.length}</Text>
            <Text style={styles.statLabel}>KATEGORI</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dongengVideos.length}+</Text>
            <Text style={styles.statLabel}>DONGENG</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    width: 120,
    height: 36,
  },
  crownBadge: {
    padding: 6,
  },
  // Hero
  heroSection: {
    paddingHorizontal: 16,
  },
  heroBg: {
    minHeight: 420,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroBgImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    padding: 28,
    gap: 14,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
  },
  heroCta: {
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  heroCtaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  // Shortcuts
  shortcutsScroll: {
    marginTop: 16,
  },
  shortcutsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  shortcutCard: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutInfo: {},
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  shortcutDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  materialIcon: {
    fontSize: 20,
  },
  // Categories
  categoryScroll: {
    marginTop: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  categoryBtn: {
    alignItems: 'center',
    gap: 6,
  },
  categoryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIconBoxActive: {
    borderColor: PRIMARY,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryLabelActive: {
    fontWeight: '800',
    color: '#0f172a',
  },
  // Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  // Dongeng
  dongengScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dongengCard: {
    width: 136,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  dongengThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e2e8f0',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dongengInfo: {
    padding: 10,
  },
  dongengTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 16,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
