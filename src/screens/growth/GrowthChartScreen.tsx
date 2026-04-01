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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, Plus, Ruler, Scale, Edit2, Trash2, Calendar,
  Baby,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = '#2DBCAF';
const API_BASE = 'https://kindergame.id';

interface Measurement {
  _id: string;
  date: string;
  height: number;
  weight: number;
  headCirc?: number;
  notes?: string;
}

function formatDate(dateStr: string): { day: string; month: string; full: string } {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return {
    day: d.getDate().toString(),
    month: months[d.getMonth()],
    full: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  };
}

export default function GrowthChartScreen() {
  const navigation = useNavigation();
  const { user, token, refreshUser } = useAuth();
  
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    headCirc: '',
    notes: ''
  });

  const activeChild = user?.children?.find((c: any) => c._id === user.activeChildId);

  const fetchMeasurements = async () => {
    if (!activeChild || !token) return;
    try {
      const res = await fetch(`${API_BASE}/api/children/${activeChild._id}/measurements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) setMeasurements(data.measurements || []);
    } catch (err) {
      console.error('Failed to fetch measurements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeasurements();
  }, [activeChild?._id, token]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      height: '',
      weight: '',
      headCirc: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (m: Measurement) => {
    setEditingId(m._id);
    setForm({
      date: m.date.split('T')[0],
      height: m.height.toString(),
      weight: m.weight.toString(),
      headCirc: m.headCirc?.toString() || '',
      notes: m.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!activeChild || !form.height || !form.weight || !token) {
      Alert.alert('Error', 'Tinggi dan berat badan wajib diisi');
      return;
    }
    setSaving(true);

    try {
      const url = editingId 
        ? `${API_BASE}/api/children/${activeChild._id}/measurements/${editingId}`
        : `${API_BASE}/api/children/${activeChild._id}/measurements`;
      
      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: form.date,
          height: Number(form.height),
          weight: Number(form.weight),
          headCirc: form.headCirc ? Number(form.headCirc) : undefined,
          notes: form.notes || undefined
        })
      });

      setShowModal(false);
      fetchMeasurements();
      if (refreshUser) refreshUser();
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan data');
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Hapus Data',
      'Hapus data pengukuran ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            if (!activeChild || !token) return;
            try {
              await fetch(`${API_BASE}/api/children/${activeChild._id}/measurements/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchMeasurements();
            } catch {}
          }
        }
      ]
    );
  };

  const latest = measurements[0];

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grafik Pertumbuhan</Text>
        </View>
        <View style={styles.emptyState}>
          <Baby size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Login Diperlukan</Text>
          <Text style={styles.emptyText}>Login untuk melihat data pertumbuhan anak</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grafik Pertumbuhan</Text>
        {activeChild && (
          <View style={styles.childTag}>
            <Text style={styles.childTagText}>{activeChild.name}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Latest Measurement Card */}
        {latest ? (
          <View style={styles.latestCard}>
            <View style={styles.latestHeader}>
              <Calendar size={18} color="#64748b" />
              <Text style={styles.latestTitle}>
                Pengukuran Terakhir — {formatDate(latest.date).full}
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
                <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
                  <Ruler size={22} color="#fff" />
                </View>
                <Text style={styles.statValue}>{latest.height}</Text>
                <Text style={styles.statUnit}>cm</Text>
                <Text style={styles.statLabel}>Tinggi Badan</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
                <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
                  <Scale size={22} color="#fff" />
                </View>
                <Text style={styles.statValue}>{latest.weight}</Text>
                <Text style={styles.statUnit}>kg</Text>
                <Text style={styles.statLabel}>Berat Badan</Text>
              </View>
            </View>
          </View>
        ) : !loading && (
          <View style={styles.emptyCard}>
            <Baby size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Belum Ada Data</Text>
            <Text style={styles.emptyText}>Tambahkan pengukuran pertama anak Anda</Text>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addBtnText}>Tambah Pengukuran</Text>
        </TouchableOpacity>

        {/* History */}
        {measurements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Riwayat Pengukuran</Text>
            {measurements.map(m => {
              const date = formatDate(m.date);
              return (
                <View key={m._id} style={styles.historyItem}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDay}>{date.day}</Text>
                    <Text style={styles.historyMonth}>{date.month}</Text>
                  </View>
                  <View style={styles.historyData}>
                    <View style={styles.historyRow}>
                      <Ruler size={16} color="#94a3b8" />
                      <Text style={styles.historyValue}><Text style={styles.historyBold}>{m.height}</Text> cm</Text>
                    </View>
                    <View style={styles.historyRow}>
                      <Scale size={16} color="#94a3b8" />
                      <Text style={styles.historyValue}><Text style={styles.historyBold}>{m.weight}</Text> kg</Text>
                    </View>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(m)}>
                      <Edit2 size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(m._id)}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Pengukuran' : 'Tambah Pengukuran'}
            </Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Tanggal</Text>
              <TextInput
                style={styles.modalInput}
                value={form.date}
                onChangeText={(v) => setForm(f => ({ ...f, date: v }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>Tinggi (cm) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.height}
                  onChangeText={(v) => setForm(f => ({ ...f, height: v }))}
                  keyboardType="numeric"
                  placeholder="85"
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>Berat (kg) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.weight}
                  onChangeText={(v) => setForm(f => ({ ...f, weight: v }))}
                  keyboardType="numeric"
                  placeholder="12.5"
                />
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Lingkar Kepala (cm) <Text style={styles.optional}>opsional</Text></Text>
              <TextInput
                style={styles.modalInput}
                value={form.headCirc}
                onChangeText={(v) => setForm(f => ({ ...f, headCirc: v }))}
                keyboardType="numeric"
                placeholder="48"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Catatan <Text style={styles.optional}>opsional</Text></Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={form.notes}
                onChangeText={(v) => setForm(f => ({ ...f, notes: v }))}
                placeholder="Catatan tambahan..."
                multiline
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={styles.modalBtnCancel} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnSave, saving && { opacity: 0.6 }]} 
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.modalBtnSaveText}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(45,188,175,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  childTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  scroll: {
    flex: 1,
  },
  latestCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  latestTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptyCard: {
    margin: 16,
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 18,
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
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 14,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    gap: 14,
  },
  historyDate: {
    width: 44,
    alignItems: 'center',
  },
  historyDay: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  historyMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  historyData: {
    flex: 1,
    gap: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyValue: {
    fontSize: 14,
    color: '#475569',
  },
  historyBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalField: {
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  modalFieldHalf: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '500',
    color: '#94a3b8',
    fontSize: 11,
  },
  modalInput: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtnCancel: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  modalBtnSave: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
