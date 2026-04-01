import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  Calendar, TrendingUp, Syringe, UtensilsCrossed, Trophy,
  ChevronRight, Crown, Baby, ArrowLeftRight, LayoutGrid,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';

interface TKFeature {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
  isActive?: boolean;
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, any> = {
  calendar_month: Calendar,
  monitoring: TrendingUp,
  vaccines: Syringe,
  restaurant: UtensilsCrossed,
  emoji_events: Trophy,
};

function formatAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} bulan`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} tahun ${m} bulan` : `${y} tahun`;
}

export default function GrowthScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [features, setFeatures] = useState<TKFeature[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = user?.subscription?.status === 'active' && 
    user?.subscription?.endDate && 
    new Date(user.subscription.endDate) > new Date();

  const activeChild = user?.children?.find((c: any) => c._id === user.activeChildId);

  useEffect(() => {
    fetch(`${API_BASE}/api/tk/features`)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.features) {
          setFeatures(data.features);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFeaturePress = (feature: TKFeature) => {
    if (feature.isPremium && !isPremium) {
      Alert.alert(
        'Fitur Premium ✨',
        `Fitur "${feature.name}" hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk akses penuh!`,
        [
          { text: 'Nanti', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Profil') },
        ]
      );
      return;
    }

    // Navigate to feature screen
    const screenMap: Record<string, string> = {
      stimulasi: 'Stimulasi',
      growth: 'GrowthChart',
      mpasi: 'MPASI',
      imunisasi: 'Imunisasi',
      milestone: 'Milestone',
    };
    const screen = screenMap[feature.slug];
    if (screen) {
      navigation.navigate(screen);
    } else {
      Alert.alert('Segera Hadir', 'Fitur ini akan segera tersedia!');
    }
  };
  
  const getFeatureIcon = (iconName?: string) => {
    return ICON_MAP[iconName || ''] || LayoutGrid;
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
          <View style={styles.headerIcon}>
            <Baby size={28} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Tumbuh Kembang</Text>
            <Text style={styles.headerSubtitle}>Pantau & stimulasi perkembangan anak</Text>
          </View>
        </View>

        {/* Active Child Banner */}
        {activeChild && (
          <View style={styles.childBanner}>
            <View style={styles.childAvatar}>
              <Text style={styles.childAvatarText}>👶</Text>
            </View>
            <View style={styles.childInfo}>
              <View style={styles.childNameRow}>
                <Text style={styles.childName}>{activeChild.name}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Aktif</Text>
                </View>
              </View>
              <Text style={styles.childAge}>{formatAge(activeChild.birthDate)}</Text>
            </View>
            {(user?.children?.length ?? 0) > 1 && (
              <TouchableOpacity 
                style={styles.switchBtn}
                onPress={() => navigation.navigate('Profil')}
              >
                <ArrowLeftRight size={16} color="#64748b" />
                <Text style={styles.switchBtnText}>Ganti</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Features */}
        <Text style={styles.sectionTitle}>Fitur Tersedia</Text>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <View style={styles.featureList}>
            {features.map(feature => {
              const IconComp = getFeatureIcon(feature.icon);
              return (
                <TouchableOpacity
                  key={feature._id}
                  style={styles.featureCard}
                  onPress={() => handleFeaturePress(feature)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color || PRIMARY }]}>
                    <IconComp size={28} color="#fff" />
                  </View>
                  <View style={styles.featureInfo}>
                    <View style={styles.featureTitleRow}>
                      <Text style={styles.featureName}>{feature.name}</Text>
                      {feature.isPremium && (
                        <View style={styles.premiumBadge}>
                          <Crown size={12} color="#fff" fill="#fff" />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featureDesc}>{feature.description || ''}</Text>
                  </View>
                  <ChevronRight size={22} color={PRIMARY} />
                </TouchableOpacity>
              );
            })}
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
  scrollContent: {
    paddingBottom: 24,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  // Child Banner
  childBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(45,188,175,0.15)',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    fontSize: 26,
  },
  childInfo: {
    flex: 1,
  },
  childNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  activeBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  childAge: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  // Feature List
  featureList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  comingSoonBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
});
