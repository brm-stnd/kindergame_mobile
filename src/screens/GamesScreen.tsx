import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Search, Heart, LayoutGrid, SearchX, ListOrdered, 
  PaintBucket, Cat, Boxes, BookA, Sparkles, 
  Languages, Lightbulb, Car, Palette,
} from 'lucide-react-native';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

interface AgeGroup {
  _id: string;
  name: string;
  slug: string;
}

interface Game {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  categories: Category[];
  ageGroups: AgeGroup[];
}

// Map icon names to Lucide components
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

export default function GamesScreen() {
  const navigation = useNavigation<any>();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCatId, setActiveCatId] = useState('semua');
  const [activeAgeId, setActiveAgeId] = useState('semua');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/games`).then(r => r.json()),
      fetch(`${API_BASE}/api/categories`).then(r => r.json()),
      fetch(`${API_BASE}/api/age-groups`).then(r => r.json()),
    ])
      .then(([g, c, a]) => {
        setGames(g);
        setCategories(c.filter((x: Category) => x.slug !== 'semua'));
        setAgeGroups(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCatId === 'semua' || g.categories.some(c => c._id === activeCatId);
    const matchAge = activeAgeId === 'semua' || g.ageGroups.some(a => a._id === activeAgeId);
    return matchSearch && matchCat && matchAge;
  });

  // Native games map
  const NATIVE_GAMES: Record<string, string> = {
    'shadow-match': 'ShadowMatch',
  };

  const handleGamePress = (game: Game) => {
    // Check if this game has a native implementation
    const nativeScreen = NATIVE_GAMES[game.slug];
    if (nativeScreen) {
      navigation.navigate(nativeScreen as never);
    } else {
      navigation.navigate('GameWebView', {
        url: `${API_BASE}/${game.slug}`,
        title: game.name,
      });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || LayoutGrid;
    return <IconComponent size={16} color={activeCatId === iconName ? '#fff' : '#64748b'} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>What shall we play today?</Text>
            <TouchableOpacity style={styles.favBtn}>
              <Heart size={16} color="#ef4444" fill="#ef4444" />
              <Text style={styles.favBtnText}>Favorit</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Search size={22} color={PRIMARY} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari game edukatif..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Age Filter */}
        <Text style={styles.filterLabel}>PILIH USIA</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.agePill, activeAgeId === 'semua' && styles.agePillActive]}
            onPress={() => setActiveAgeId('semua')}
          >
            <Text style={[styles.agePillText, activeAgeId === 'semua' && styles.agePillTextActive]}>
              Semua
            </Text>
          </TouchableOpacity>
          {ageGroups.map(ag => (
            <TouchableOpacity
              key={ag._id}
              style={[styles.agePill, activeAgeId === ag._id && styles.agePillActive]}
              onPress={() => setActiveAgeId(ag._id)}
            >
              <Text style={[styles.agePillText, activeAgeId === ag._id && styles.agePillTextActive]}>
                {ag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[styles.catPill, activeCatId === 'semua' && styles.catPillActive]}
            onPress={() => setActiveCatId('semua')}
          >
            <LayoutGrid size={16} color={activeCatId === 'semua' ? '#fff' : '#64748b'} />
            <Text style={[styles.catPillText, activeCatId === 'semua' && styles.catPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => {
            const IconComp = ICON_MAP[cat.icon] || LayoutGrid;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[styles.catPill, activeCatId === cat._id && styles.catPillActive]}
                onPress={() => setActiveCatId(cat._id)}
              >
                <IconComp size={16} color={activeCatId === cat._id ? '#fff' : '#64748b'} />
                <Text style={[styles.catPillText, activeCatId === cat._id && styles.catPillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Game Grid */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.emptyText}>Memuat game...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <SearchX size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Game tidak ditemukan</Text>
          </View>
        ) : (
          <View style={styles.gameGrid}>
            {filtered.map((game, index) => (
              <TouchableOpacity
                key={game._id}
                style={styles.gameCard}
                onPress={() => handleGamePress(game)}
                activeOpacity={0.85}
              >
                <View style={styles.gameThumbWrap}>
                  {game.image ? (
                    <Image
                      source={{ uri: game.image.startsWith('http') ? game.image : `${API_BASE}${game.image}` }}
                      style={styles.gameThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.gameThumb, styles.gameThumbPlaceholder]}>
                      <Sparkles size={32} color={PRIMARY} />
                    </View>
                  )}
                  {index < 3 && (
                    <View style={styles.newBadge}>
                      <Sparkles size={10} color="#fff" />
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>
                  {game.categories[0] && (
                    <View style={styles.gameTag}>
                      <Text style={styles.gameTagText}>{game.categories[0].name}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.18)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  favBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  searchWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 52,
    paddingLeft: 46,
    paddingRight: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(45,188,175,0.15)',
    borderRadius: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  filterLabel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  agePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  agePillActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  agePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  agePillTextActive: {
    color: '#fff',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 8,
    flexDirection: 'row',
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  catPillActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  catPillTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 12,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
  },
  gameCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  gameThumbWrap: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
  },
  gameThumb: {
    width: '100%',
    height: '100%',
  },
  gameThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5F3',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  gameInfo: {
    padding: 12,
  },
  gameName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 6,
  },
  gameTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,188,175,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gameTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
});
