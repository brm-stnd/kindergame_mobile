import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Clock, Leaf, ChefHat } from 'lucide-react-native';

const PRIMARY = '#2DBCAF';

interface Recipe {
  id: string;
  name: string;
  age: string;
  duration: string;
  ingredients: string[];
  image: string;
  category: 'Buah' | 'Sayur' | 'Protein' | 'Karbohidrat';
}

const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Puree Pisang',
    age: '6 bulan+',
    duration: '5 menit',
    category: 'Buah',
    ingredients: ['1 buah pisang matang'],
    image: '🍌',
  },
  {
    id: '2',
    name: 'Puree Alpukat',
    age: '6 bulan+',
    duration: '5 menit',
    category: 'Buah',
    ingredients: ['1/2 buah alpukat matang'],
    image: '🥑',
  },
  {
    id: '3',
    name: 'Bubur Wortel',
    age: '6 bulan+',
    duration: '15 menit',
    category: 'Sayur',
    ingredients: ['1 buah wortel', 'Air secukupnya'],
    image: '🥕',
  },
  {
    id: '4',
    name: 'Bubur Beras Merah',
    age: '6 bulan+',
    duration: '20 menit',
    category: 'Karbohidrat',
    ingredients: ['2 sdm beras merah', 'Air 200ml'],
    image: '🍚',
  },
  {
    id: '5',
    name: 'Puree Ayam',
    age: '7 bulan+',
    duration: '25 menit',
    category: 'Protein',
    ingredients: ['50g daging ayam', 'Air kaldu'],
    image: '🍗',
  },
  {
    id: '6',
    name: 'Bubur Labu Kuning',
    age: '6 bulan+',
    duration: '15 menit',
    category: 'Sayur',
    ingredients: ['100g labu kuning', 'Air secukupnya'],
    image: '🎃',
  },
  {
    id: '7',
    name: 'Puree Kentang',
    age: '6 bulan+',
    duration: '20 menit',
    category: 'Karbohidrat',
    ingredients: ['1 buah kentang', 'ASI/susu formula'],
    image: '🥔',
  },
  {
    id: '8',
    name: 'Bubur Ikan Salmon',
    age: '8 bulan+',
    duration: '25 menit',
    category: 'Protein',
    ingredients: ['30g salmon', 'Bubur nasi', 'Sayuran'],
    image: '🐟',
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Buah': { bg: '#FEF3C7', text: '#D97706' },
  'Sayur': { bg: '#D1FAE5', text: '#059669' },
  'Protein': { bg: '#FEE2E2', text: '#DC2626' },
  'Karbohidrat': { bg: '#E0E7FF', text: '#4F46E5' },
};

const CATEGORIES = ['Semua', 'Buah', 'Sayur', 'Protein', 'Karbohidrat'];

export default function MPASIScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecipes = selectedCategory === 'Semua' 
    ? RECIPES 
    : RECIPES.filter(r => r.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panduan MPASI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <ChefHat size={32} color={PRIMARY} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Menu MPASI Sehat</Text>
            <Text style={styles.infoDesc}>
              Resep bergizi untuk bayi usia 6 bulan - 2 tahun
            </Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipes */}
        <Text style={styles.sectionTitle}>
          {filteredRecipes.length} RESEP
        </Text>

        {filteredRecipes.map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
          >
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeEmoji}>{recipe.image}</Text>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <View style={styles.recipeMeta}>
                  <View style={[
                    styles.categoryBadge, 
                    { backgroundColor: CATEGORY_COLORS[recipe.category].bg }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText,
                      { color: CATEGORY_COLORS[recipe.category].text }
                    ]}>
                      {recipe.category}
                    </Text>
                  </View>
                  <View style={styles.ageBadge}>
                    <Leaf size={10} color="#22C55E" />
                    <Text style={styles.ageText}>{recipe.age}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Clock size={12} color="#64748b" />
                <Text style={styles.durationText}>{recipe.duration}</Text>
              </View>
            </View>

            {expandedId === recipe.id && (
              <View style={styles.recipeExpanded}>
                <Text style={styles.ingredientsTitle}>Bahan:</Text>
                {recipe.ingredients.map((ing, i) => (
                  <Text key={i} style={styles.ingredientItem}>• {ing}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips MPASI</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Mulai dengan tekstur halus (puree)</Text>
            <Text style={styles.tipItem}>• Perkenalkan 1 jenis makanan baru per 3 hari</Text>
            <Text style={styles.tipItem}>• Hindari gula dan garam di bawah 1 tahun</Text>
            <Text style={styles.tipItem}>• ASI tetap utama hingga 2 tahun</Text>
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
    backgroundColor: '#f6f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  infoDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  categoryScroll: {
    marginTop: 16,
    marginHorizontal: -16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ageText: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f6f8f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  recipeExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ingredientsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  ingredientItem: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 13,
    color: '#22C55E',
    lineHeight: 20,
  },
});
