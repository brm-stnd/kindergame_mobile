import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Check, X,
  Baby, Lightbulb, Info,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAYS_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const ASPECTS = [
  { key: 'motorikKasar', name: 'Mot.\nKasar', icon: '🏃', color: '#F59E0B' },
  { key: 'motorikHalus', name: 'Mot.\nHalus', icon: '✋', color: '#10B981' },
  { key: 'bicara', name: 'Bicara', icon: '🗣️', color: '#3B82F6' },
  { key: 'sosial', name: 'Sosial', icon: '👥', color: '#8B5CF6' },
];

interface Activity {
  _id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  metadata: {
    week: number;
    day: number;
    tips?: string;
    duration?: number;
  };
}

interface Progress {
  contentId: string;
  status: 'completed' | 'pending' | 'skipped';
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function formatAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} bulan`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} thn ${m} bln` : `${y} tahun`;
}

function getAgeGroup(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return '0-1';
  if (months < 24) return '1-2';
  if (months < 36) return '2-3';
  if (months < 48) return '3-4';
  if (months < 60) return '4-5';
  return '5-6';
}

export default function StimulasiScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showModal, setShowModal] = useState(false);

  const activeChild = user?.children?.find((c: any) => c._id === user.activeChildId);
  const ageGroup = activeChild ? getAgeGroup(activeChild.birthDate) : '3-4';

  useEffect(() => {
    fetchActivities();
  }, [currentWeek, ageGroup]);

  useEffect(() => {
    if (token) fetchProgress();
  }, [token, currentWeek]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/tk/content/stimulasi?ageGroup=${ageGroup}&week=${currentWeek}`
      );
      const data = await res.json();
      if (data.ok && data.content) {
        setActivities(data.content);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tk/progress/stimulasi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok && data.progress) {
        setProgress(data.progress.map((p: any) => ({
          contentId: p.contentId?._id || p.contentId,
          status: p.status,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const toggleActivity = async (activityId: string) => {
    if (!token) {
      Alert.alert('Login diperlukan', 'Silakan login untuk menyimpan progress');
      return;
    }

    const current = progress.find(p => p.contentId === activityId);
    const newStatus = current?.status === 'completed' ? 'pending' : 'completed';

    setProgress(prev => {
      const exists = prev.find(p => p.contentId === activityId);
      if (exists) {
        return prev.map(p => p.contentId === activityId ? { ...p, status: newStatus } : p);
      }
      return [...prev, { contentId: activityId, status: newStatus }];
    });

    try {
      if (newStatus === 'completed') {
        await fetch(`${API_BASE}/api/tk/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentId: activityId, status: 'completed' }),
        });
      } else {
        await fetch(`${API_BASE}/api/tk/progress/${activityId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      fetchProgress();
    }
    
    setShowModal(false);
  };

  const isCompleted = (id: string) => progress.some(p => p.contentId === id && p.status === 'completed');

  // Build grid data: activities[day][aspect]
  const gridData = useMemo(() => {
    const grid: (Activity | null)[][] = Array(7).fill(null).map(() => Array(4).fill(null));
    
    activities.forEach(activity => {
      const dayIndex = activity.metadata.day - 1;
      const aspectIndex = ASPECTS.findIndex(a => a.key === activity.category);
      if (dayIndex >= 0 && dayIndex < 7 && aspectIndex >= 0) {
        grid[dayIndex][aspectIndex] = activity;
      }
    });
    
    return grid;
  }, [activities]);

  // Calculate progress
  const totalActivities = activities.length;
  const completedCount = activities.filter(a => isCompleted(a._id)).length;
  const progressPct = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  const openActivityModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const cellWidth = (SCREEN_WIDTH - 32 - 50 - 18) / 4; // padding - dayLabel - gaps

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Stimulasi</Text>
        {activeChild && (
          <View style={styles.childTag}>
            <Baby size={14} color={PRIMARY} />
            <Text style={styles.childTagText}>{formatAge(activeChild.birthDate)}</Text>
          </View>
        )}
      </View>

      {/* Week Navigator */}
      <View style={styles.weekNav}>
        <TouchableOpacity 
          onPress={() => setCurrentWeek(w => Math.max(1, w - 1))}
          style={styles.weekBtn}
        >
          <ChevronLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.weekLabel}>
          <Text style={styles.weekTitle}>Minggu {currentWeek}</Text>
          <Text style={styles.weekSub}>Usia {ageGroup} tahun</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setCurrentWeek(w => Math.min(52, w + 1))}
          style={styles.weekBtn}
        >
          <ChevronRight size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress Minggu Ini</Text>
          <Text style={styles.progressPct}>{progressPct}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.progressText}>{completedCount} dari {totalActivities} aktivitas selesai</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {/* Header Row - Aspects */}
            <View style={styles.gridRow}>
              <View style={styles.dayLabelEmpty} />
              {ASPECTS.map(aspect => (
                <View key={aspect.key} style={[styles.aspectHeader, { backgroundColor: aspect.color, width: cellWidth }]}>
                  <Text style={styles.aspectIcon}>{aspect.icon}</Text>
                  <Text style={styles.aspectName}>{aspect.name}</Text>
                </View>
              ))}
            </View>

            {/* Grid Rows - Days */}
            {DAYS.map((day, dayIndex) => (
              <View key={day} style={styles.gridRow}>
                <View style={styles.dayLabel}>
                  <Text style={styles.dayLabelText}>{day}</Text>
                </View>
                {ASPECTS.map((aspect, aspectIndex) => {
                  const activity = gridData[dayIndex][aspectIndex];
                  const done = activity ? isCompleted(activity._id) : false;
                  
                  if (!activity) {
                    return <View key={aspect.key} style={[styles.emptyCell, { width: cellWidth }]} />;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={aspect.key}
                      style={[
                        styles.activityCell,
                        { width: cellWidth, borderColor: done ? aspect.color : '#e2e8f0' },
                        done && { backgroundColor: `${aspect.color}15` }
                      ]}
                      onPress={() => openActivityModal(activity)}
                    >
                      <Text style={styles.cellTitle} numberOfLines={3}>{activity.title}</Text>
                      <View style={[styles.cellCheck, { backgroundColor: done ? aspect.color : '#e2e8f0' }]}>
                        {done && <Check size={10} color="#fff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* References */}
      <View style={styles.referencesCard}>
        <View style={styles.referencesHeader}>
          <Info size={16} color="#64748b" />
          <Text style={styles.referencesTitle}>Referensi Kurikulum</Text>
        </View>
        <Text style={styles.referencesText}>
          • STPPA Permendikbud 137/2014{'\n'}
          • KPSP Kemenkes RI{'\n'}
          • Milestone Perkembangan WHO
        </Text>
        <Text style={styles.disclaimer}>
          Aktivitas ini bersifat panduan. Konsultasikan dengan tenaga kesehatan untuk penilaian lebih lanjut.
        </Text>
      </View>

      {/* Activity Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedActivity && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIcon, { backgroundColor: ASPECTS.find(a => a.key === selectedActivity.category)?.color || PRIMARY }]}>
                    <Text style={styles.modalIconText}>
                      {ASPECTS.find(a => a.key === selectedActivity.category)?.icon || '📋'}
                    </Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalMeta}>
                  {DAYS_FULL[selectedActivity.metadata.day - 1]} • {
                    selectedActivity.category === 'motorikKasar' ? 'Motorik Kasar' :
                    selectedActivity.category === 'motorikHalus' ? 'Motorik Halus' :
                    selectedActivity.category === 'bicara' ? 'Bahasa' : 'Sosial'
                  }
                </Text>

                <Text style={styles.modalDesc}>{selectedActivity.description}</Text>

                {selectedActivity.metadata.tips && (
                  <View style={styles.tipsCard}>
                    <Lightbulb size={18} color="#F59E0B" />
                    <Text style={styles.tipsText}>{selectedActivity.metadata.tips}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    isCompleted(selectedActivity._id) && styles.modalBtnDone
                  ]}
                  onPress={() => toggleActivity(selectedActivity._id)}
                >
                  {isCompleted(selectedActivity._id) ? (
                    <>
                      <Check size={20} color="#fff" />
                      <Text style={styles.modalBtnText}>Sudah Selesai ✓</Text>
                    </>
                  ) : (
                    <Text style={styles.modalBtnText}>Tandai Selesai</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  childTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(45,188,175,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  childTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  weekBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  weekLabel: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  weekSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  progressCard: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  gridContainer: {
    padding: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dayLabelEmpty: {
    width: 50,
  },
  aspectHeader: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspectIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  aspectName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  dayLabel: {
    width: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  emptyCell: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 10,
    minHeight: 60,
  },
  activityCell: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 6,
    minHeight: 60,
    position: 'relative',
  },
  cellTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 12,
  },
  cellCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referencesCard: {
    margin: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  referencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  referencesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  referencesText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    fontSize: 22,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalClose: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  modalMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  modalBtn: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalBtnDone: {
    backgroundColor: '#22C55E',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
