import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, Check, ChevronDown, ChevronUp, Syringe,
  Baby, AlertCircle, Shield, Clock,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';

interface Dose {
  doseNumber: number;
  name: string;
  ageLabel: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'skipped';
  isOverdue: boolean;
  completedDate?: string;
  location?: string;
  progressId?: string;
}

interface Vaccine {
  code: string;
  name: string;
  type: 'wajib' | 'anjuran';
  description: string;
  benefits: string[];
  sideEffects: string[];
  doses: Dose[];
  totalDoses: number;
  completedDoses: number;
  isComplete: boolean;
}

interface ScheduleData {
  child: { _id: string; name: string; birthDate: string; ageMonths: number };
  schedule: Vaccine[];
  stats: { totalWajib: number; completedWajib: number; percentWajib: number };
}

function formatAge(months: number): string {
  if (months < 12) return `${months} bulan`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} tahun ${m} bulan` : `${y} tahun`;
}

export default function ImunisasiScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScheduleData | null>(null);
  const [activeTab, setActiveTab] = useState<'wajib' | 'anjuran'>('wajib');
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState<{ vaccine: Vaccine; dose: Dose } | null>(null);
  const [updating, setUpdating] = useState(false);

  const activeChild = user?.children?.find((c: any) => c._id === user.activeChildId);

  const fetchSchedule = async () => {
    if (!activeChild || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/immunization/schedule/${activeChild._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.ok) setData(result);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [activeChild?._id, token]);

  const toggleVaccine = (code: string) => {
    setExpandedVaccine(expandedVaccine === code ? null : code);
  };

  const openDoseModal = (vaccine: Vaccine, dose: Dose) => {
    setSelectedDose({ vaccine, dose });
    setShowDoseModal(true);
  };

  const markDoseComplete = async () => {
    if (!selectedDose || !activeChild || !token) return;
    setUpdating(true);

    try {
      await fetch(`${API_BASE}/api/immunization/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          childId: activeChild._id,
          vaccineCode: selectedDose.vaccine.code,
          doseNumber: selectedDose.dose.doseNumber,
          status: 'completed',
          completedDate: new Date().toISOString()
        })
      });
      
      setShowDoseModal(false);
      fetchSchedule();
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan data');
    }
    setUpdating(false);
  };

  const undoDose = async () => {
    if (!selectedDose?.dose.progressId || !token) return;
    setUpdating(true);

    try {
      await fetch(`${API_BASE}/api/immunization/progress/${selectedDose.dose.progressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowDoseModal(false);
      fetchSchedule();
    } catch (err) {
      Alert.alert('Error', 'Gagal menghapus data');
    }
    setUpdating(false);
  };

  const vaccines = data?.schedule.filter(v => v.type === activeTab) || [];
  const stats = data?.stats;

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checklist Imunisasi</Text>
        </View>
        <View style={styles.emptyState}>
          <Syringe size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Login Diperlukan</Text>
          <Text style={styles.emptyText}>Login untuk melihat jadwal imunisasi anak</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist Imunisasi</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Child Selector */}
        {activeChild && (
          <View style={styles.childCard}>
            <View style={styles.childAvatar}>
              <Baby size={24} color="#F59E0B" />
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{activeChild.name}</Text>
              <Text style={styles.childAge}>{data?.child ? formatAge(data.child.ageMonths) : ''}</Text>
            </View>
          </View>
        )}

        {/* Progress Card */}
        {stats && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>IMUNISASI DASAR LENGKAP</Text>
            <View style={styles.progressBarWrap}>
              <View style={[styles.progressFill, { width: `${stats.percentWajib}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {stats.completedWajib} dari {stats.totalWajib} vaksin wajib selesai ({stats.percentWajib}%)
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wajib' && styles.tabActive]}
            onPress={() => setActiveTab('wajib')}
          >
            <Shield size={16} color={activeTab === 'wajib' ? PRIMARY : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'wajib' && styles.tabTextActive]}>Wajib</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'anjuran' && styles.tabActive]}
            onPress={() => setActiveTab('anjuran')}
          >
            <Syringe size={16} color={activeTab === 'anjuran' ? PRIMARY : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'anjuran' && styles.tabTextActive]}>Anjuran</Text>
          </TouchableOpacity>
        </View>

        {/* Vaccines List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <View style={styles.vaccineList}>
            {vaccines.map(vaccine => {
              const isExpanded = expandedVaccine === vaccine.code;
              const pendingDoses = vaccine.doses.filter(d => d.status === 'pending');
              const overdueDoses = pendingDoses.filter(d => d.isOverdue);
              
              return (
                <View key={vaccine.code} style={styles.vaccineCard}>
                  {/* Vaccine Header */}
                  <TouchableOpacity 
                    style={styles.vaccineHeader}
                    onPress={() => toggleVaccine(vaccine.code)}
                  >
                    <View style={[
                      styles.vaccineIcon,
                      vaccine.isComplete && styles.vaccineIconComplete
                    ]}>
                      {vaccine.isComplete ? (
                        <Check size={20} color="#fff" />
                      ) : (
                        <Syringe size={20} color={PRIMARY} />
                      )}
                    </View>
                    <View style={styles.vaccineInfo}>
                      <Text style={styles.vaccineName}>{vaccine.name}</Text>
                      <Text style={styles.vaccineProgress}>
                        {vaccine.completedDoses}/{vaccine.totalDoses} dosis
                        {overdueDoses.length > 0 && (
                          <Text style={styles.overdueText}> • {overdueDoses.length} terlambat</Text>
                        )}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color="#64748b" />
                    ) : (
                      <ChevronDown size={20} color="#64748b" />
                    )}
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.vaccineBody}>
                      <Text style={styles.vaccineDesc}>{vaccine.description}</Text>

                      {/* Benefits */}
                      {vaccine.benefits.length > 0 && (
                        <View style={styles.infoSection}>
                          <Text style={styles.infoTitle}>✅ Manfaat</Text>
                          {vaccine.benefits.map((b, i) => (
                            <Text key={i} style={styles.infoItem}>• {b}</Text>
                          ))}
                        </View>
                      )}

                      {/* Side Effects */}
                      {vaccine.sideEffects.length > 0 && (
                        <View style={styles.infoSection}>
                          <Text style={styles.infoTitle}>⚠️ Efek Samping Umum</Text>
                          {vaccine.sideEffects.map((s, i) => (
                            <Text key={i} style={styles.infoItem}>• {s}</Text>
                          ))}
                        </View>
                      )}

                      {/* Doses */}
                      <View style={styles.dosesSection}>
                        <Text style={styles.dosesTitle}>Jadwal Dosis</Text>
                        {vaccine.doses.map(dose => (
                          <TouchableOpacity 
                            key={dose.doseNumber}
                            style={[
                              styles.doseItem,
                              dose.status === 'completed' && styles.doseItemComplete,
                              dose.isOverdue && dose.status === 'pending' && styles.doseItemOverdue
                            ]}
                            onPress={() => openDoseModal(vaccine, dose)}
                          >
                            <View style={[
                              styles.doseCheck,
                              dose.status === 'completed' && styles.doseCheckComplete
                            ]}>
                              {dose.status === 'completed' && <Check size={12} color="#fff" />}
                            </View>
                            <View style={styles.doseInfo}>
                              <Text style={styles.doseName}>{dose.name}</Text>
                              <Text style={styles.doseAge}>{dose.ageLabel}</Text>
                            </View>
                            {dose.isOverdue && dose.status === 'pending' && (
                              <View style={styles.overdueBadge}>
                                <Clock size={10} color="#fff" />
                                <Text style={styles.overdueBadgeText}>Terlambat</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Dose Action Modal */}
      <Modal
        visible={showDoseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDoseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedDose && (
              <>
                <Text style={styles.modalTitle}>{selectedDose.vaccine.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDose.dose.name} • {selectedDose.dose.ageLabel}
                </Text>

                {selectedDose.dose.status === 'completed' ? (
                  <>
                    <View style={styles.completedBadge}>
                      <Check size={20} color="#22C55E" />
                      <Text style={styles.completedText}>Sudah dilakukan</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.undoBtn}
                      onPress={undoDose}
                      disabled={updating}
                    >
                      <Text style={styles.undoBtnText}>
                        {updating ? 'Menghapus...' : 'Batalkan'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={[styles.markBtn, updating && { opacity: 0.6 }]}
                    onPress={markDoseComplete}
                    disabled={updating}
                  >
                    <Check size={20} color="#fff" />
                    <Text style={styles.markBtnText}>
                      {updating ? 'Menyimpan...' : 'Tandai Selesai'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => setShowDoseModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Tutup</Text>
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
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(45,188,175,0.2)',
    gap: 12,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  childAge: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  progressBarWrap: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(45,188,175,0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: PRIMARY,
  },
  loadingWrap: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  vaccineList: {
    paddingHorizontal: 16,
  },
  vaccineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  vaccineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  vaccineIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(45,188,175,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaccineIconComplete: {
    backgroundColor: '#22C55E',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  vaccineProgress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  overdueText: {
    color: '#EF4444',
  },
  vaccineBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  vaccineDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  infoItem: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 20,
  },
  dosesSection: {
    marginTop: 8,
  },
  dosesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  doseItemComplete: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  doseItemOverdue: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  doseCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseCheckComplete: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  doseInfo: {
    flex: 1,
  },
  doseName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  doseAge: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22C55E',
  },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    marginBottom: 12,
  },
  markBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  undoBtn: {
    height: 48,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  undoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  cancelBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
