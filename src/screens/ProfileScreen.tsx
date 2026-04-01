import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { 
  Crown, Settings, HelpCircle, FileText, LogOut,
  Save, TrendingUp, Shield, Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const PRIMARY = '#2DBCAF';

// Google OAuth - use WEB client ID for expo-auth-session
const GOOGLE_WEB_CLIENT_ID = '1051639643852-c29g9urlhcbtidakci9g5e0e3p6ruf4q.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '1051639643852-jjmnusfre4qf87q9ou3g6d3s4e71lbgp.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '1051639643852-o0hldhar6fjd709hf6qik77pbgnai5h5.apps.googleusercontent.com';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, loginWithGoogle, loading: authLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    try {
      setIsLoggingIn(true);
      // Get user info from Google
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();
      
      // Login with our backend
      const result = await loginWithGoogle({
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.id,
        avatar: userInfo.picture,
      });
      
      if (!result.ok) {
        Alert.alert('Error', result.error || 'Gagal login');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Gagal login dengan Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const isLoading = authLoading || isLoggingIn;

  // Not logged in - show login screen
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.guestWrapper}>
          <View style={styles.guestCard}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.guestTitle}>
              Masuk untuk menyimpan progress & mengakses fitur premium
            </Text>

            <TouchableOpacity 
              style={[styles.googleBtn, (!request || isLoading) && styles.googleBtnDisabled]} 
              onPress={() => promptAsync()}
              disabled={!request || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <>
                  <Image 
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>KEUNTUNGAN LOGIN</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Save size={28} color={PRIMARY} />
                <Text style={styles.featureText}>Simpan Progress</Text>
              </View>
              <View style={styles.featureCard}>
                <TrendingUp size={28} color={PRIMARY} />
                <Text style={styles.featureText}>Grafik Tumbuh Kembang</Text>
              </View>
              <View style={styles.featureCard}>
                <Shield size={28} color={PRIMARY} />
                <Text style={styles.featureText}>Kontrol Orang Tua</Text>
              </View>
              <View style={styles.featureCard}>
                <Sparkles size={28} color={PRIMARY} />
                <Text style={styles.featureText}>Fitur Premium</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.guestFooter}>
          <Text style={styles.footerText}>
            Dengan masuk, kamu menyetujui Syarat & Ketentuan kami
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in - show profile
  const activeChild = user.children?.find(c => c._id === user.activeChildId);
  const isPremium = user.subscription?.status === 'active' && 
    user.subscription?.endDate && 
    new Date(user.subscription.endDate) > new Date();

  const displayName = activeChild?.name || user.name || 'User';
  const initials = displayName[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarInitials}>
              <Text style={styles.avatarInitialsText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={14} color="#fff" fill="#fff" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Children */}
        {user.children && user.children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ANAK</Text>
            <View style={styles.childrenList}>
              {user.children.map(child => (
                <TouchableOpacity 
                  key={child._id} 
                  style={[
                    styles.childCard,
                    child._id === user.activeChildId && styles.childCardActive
                  ]}
                >
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>{child.name[0]}</Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                  </View>
                  {child._id === user.activeChildId && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={22} color="#475569" />
            <Text style={styles.menuText}>Pengaturan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={22} color="#475569" />
            <Text style={styles.menuText}>Bantuan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <FileText size={22} color="#475569" />
            <Text style={styles.menuText}>Kebijakan Privasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={22} color="#EF4444" />
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
  },
  // Guest styles
  guestWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  guestCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: 'rgba(45,188,175,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    height: 96,
    width: 200,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleBtnDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerLabel: {
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(45,188,175,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(45,188,175,0.12)',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginTop: 8,
  },
  guestFooter: {
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  // Logged in styles
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: PRIMARY,
  },
  avatarInitials: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 12,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  childrenList: {
    gap: 10,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  childCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#F0FDFA',
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  menu: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
});
