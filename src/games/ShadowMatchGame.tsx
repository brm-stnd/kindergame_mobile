import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#2DBCAF';
const IMG_BASE = 'https://kindergame.id/assets/images/animals';

// Animal data
interface Animal { nameId: string; emoji: string; slug: string; }
const ANIMALS: Animal[] = [
  { nameId: 'Gajah', emoji: '🐘', slug: 'elephant' },
  { nameId: 'Singa', emoji: '🦁', slug: 'lion' },
  { nameId: 'Kucing', emoji: '🐱', slug: 'cat' },
  { nameId: 'Anjing', emoji: '🐶', slug: 'dog' },
  { nameId: 'Ayam', emoji: '🐔', slug: 'chicken' },
  { nameId: 'Sapi', emoji: '🐄', slug: 'cow' },
  { nameId: 'Bebek', emoji: '🦆', slug: 'duck' },
  { nameId: 'Ikan', emoji: '🐟', slug: 'fish' },
  { nameId: 'Lumba-lumba', emoji: '🐬', slug: 'dolphin' },
  { nameId: 'Kura-kura', emoji: '🐢', slug: 'turtle' },
  { nameId: 'Monyet', emoji: '🐵', slug: 'monkey' },
  { nameId: 'Harimau', emoji: '🐯', slug: 'tiger' },
  { nameId: 'Beruang', emoji: '🐻', slug: 'bear' },
  { nameId: 'Panda', emoji: '🐼', slug: 'panda' },
  { nameId: 'Jerapah', emoji: '🦒', slug: 'giraffe' },
  { nameId: 'Zebra', emoji: '🦓', slug: 'zebra' },
  { nameId: 'Kuda', emoji: '🐴', slug: 'horse' },
  { nameId: 'Burung', emoji: '🐦', slug: 'bird' },
  { nameId: 'Pinguin', emoji: '🐧', slug: 'penguin' },
  { nameId: 'Katak', emoji: '🐸', slug: 'frog' },
  { nameId: 'Kelinci', emoji: '🐰', slug: 'rabbit' },
];

const MAX_ROUNDS = 10;
type OptionStatus = 'idle' | 'correct' | 'incorrect' | 'disabled';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ShadowMatchGame() {
  const navigation = useNavigation();
  
  // Game state
  const [showIntro, setShowIntro] = useState(true);
  const [questions, setQuestions] = useState<Animal[]>([]);
  const [current, setCurrent] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<Record<string, OptionStatus>>({});
  const [answered, setAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Animations
  const shadowBounce = useRef(new Animated.Value(1)).current;
  const optionAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  // Start bouncing animation for shadow
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(shadowBounce, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(shadowBounce, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  const generateRound = useCallback((q: Animal[], r: number) => {
    setFeedback({});
    setAnswered(false);
    setRevealed(false);
    
    const correct = q[r - 1];
    const wrong = ANIMALS.filter(a => a.slug !== correct.slug)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setCurrent(correct);
    setOptions(shuffleArray([correct, ...wrong]));
    
    // Animate options in
    optionAnimations.forEach((anim, i) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        delay: i * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [optionAnimations]);

  const startGame = useCallback(() => {
    const q = shuffleArray(ANIMALS).slice(0, MAX_ROUNDS);
    setQuestions(q);
    setScore(0);
    setRound(1);
    setShowResultModal(false);
    setShowIntro(false);
    generateRound(q, 1);
  }, [generateRound]);

  const handleAnswer = useCallback((selectedAnimal: Animal) => {
    if (answered || !current) return;
    setAnswered(true);
    setRevealed(true);

    const isCorrect = selectedAnimal.slug === current.slug;

    if (isCorrect) {
      setFeedback({ [selectedAnimal.slug]: 'correct' });
      setScore(s => s + 10);
      // Correct animation
      resultScale.setValue(0);
      Animated.spring(resultScale, { toValue: 1, useNativeDriver: true }).start();
    } else {
      const fb: Record<string, OptionStatus> = {};
      options.forEach(o => {
        if (o.slug === selectedAnimal.slug) fb[o.slug] = 'incorrect';
        else if (o.slug === current.slug) fb[o.slug] = 'correct';
        else fb[o.slug] = 'disabled';
      });
      setFeedback(fb);
    }

    setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        setShowResultModal(true);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        generateRound(questions, nextRound);
      }
    }, isCorrect ? 1200 : 1500);
  }, [answered, current, options, round, questions, generateRound, resultScale]);

  const getStatus = (slug: string): OptionStatus => {
    if (feedback[slug]) return feedback[slug];
    if (answered) return 'disabled';
    return 'idle';
  };

  // Intro Screen
  if (showIntro) {
    return (
      <SafeAreaView style={styles.introContainer} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.introHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={26} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Character Area */}
        <View style={styles.charArea}>
          {/* Floating shadows */}
          <Animated.View style={[styles.floatShadow, { top: '15%', left: '8%' }]}>
            <Image 
              source={{ uri: `${IMG_BASE}/animal_elephant.png` }} 
              style={[styles.floatImg, { tintColor: '#000' }]} 
            />
          </Animated.View>
          <Animated.View style={[styles.floatShadow, { top: '10%', right: '10%' }]}>
            <Image 
              source={{ uri: `${IMG_BASE}/animal_lion.png` }} 
              style={[styles.floatImg, { tintColor: '#000' }]} 
            />
          </Animated.View>
          <Animated.View style={[styles.floatShadow, { bottom: '25%', left: '10%' }]}>
            <Image 
              source={{ uri: `${IMG_BASE}/animal_giraffe.png` }} 
              style={[styles.floatImg, { tintColor: '#000' }]} 
            />
          </Animated.View>
          <Animated.View style={[styles.floatShadow, { bottom: '20%', right: '8%' }]}>
            <Image 
              source={{ uri: `${IMG_BASE}/animal_penguin.png` }} 
              style={[styles.floatImg, { tintColor: '#000' }]} 
            />
          </Animated.View>
          
          {/* Main character */}
          <Animated.View style={[styles.mainChar, { transform: [{ scale: shadowBounce }] }]}>
            <Image 
              source={{ uri: `${IMG_BASE}/animal_elephant.png` }} 
              style={[styles.mainCharImg, { tintColor: '#000' }]} 
            />
          </Animated.View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.handle} />
          <Text style={styles.introTitle}>Tebak <Text style={styles.introTitleAccent}>Bayangan!</Text></Text>
          <Text style={styles.introDesc}>
            Lihat bayangan hewan lalu pilih gambar yang sesuai! Cocokkan bayangan dengan hewan yang benar 🕵️
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Mulai Bermain</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Screen
  return (
    <SafeAreaView style={styles.gameContainer} edges={['top']}>
      {/* Header */}
      <View style={styles.gameHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setShowIntro(true)} style={styles.backBtn}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.gameTitle}>Tebak Bayangan</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Star size={14} color={PRIMARY} fill={PRIMARY} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Game Body */}
      <View style={styles.gameBody}>
        <Text style={styles.roundInfo}>Ronde {round} / {MAX_ROUNDS}</Text>

        {/* Shadow Box */}
        <View style={[
          styles.shadowBox,
          revealed && feedback[current?.slug || ''] === 'correct' && styles.shadowBoxCorrect,
          revealed && feedback[current?.slug || ''] !== 'correct' && Object.values(feedback).includes('incorrect') && styles.shadowBoxIncorrect,
        ]}>
          {current && (
            <Image 
              source={{ uri: `${IMG_BASE}/animal_${current.slug}.png` }} 
              style={[
                styles.shadowImg, 
                !revealed && { tintColor: '#000' }
              ]} 
            />
          )}
          {revealed && (
            <Text style={[
              styles.resultLabel,
              Object.values(feedback).includes('incorrect') ? styles.resultIncorrect : styles.resultCorrect
            ]}>
              {Object.values(feedback).includes('incorrect') 
                ? `❌ Ini ${current?.nameId}!`
                : `✅ ${current?.nameId}!`}
            </Text>
          )}
        </View>

        {/* Options Grid */}
        <View style={styles.optionsGrid}>
          {options.map((animal, index) => {
            const status = getStatus(animal.slug);
            return (
              <Animated.View 
                key={animal.slug}
                style={[
                  styles.optionCardWrap,
                  { 
                    transform: [
                      { scale: optionAnimations[index] },
                    ],
                    opacity: optionAnimations[index],
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    status === 'correct' && styles.optionCorrect,
                    status === 'incorrect' && styles.optionIncorrect,
                    status === 'disabled' && styles.optionDisabled,
                  ]}
                  onPress={() => handleAnswer(animal)}
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: `${IMG_BASE}/animal_${animal.slug}.png` }} 
                    style={styles.optionImg} 
                  />
                  {status !== 'idle' && status !== 'disabled' && (
                    <Text style={[
                      styles.optionLabel,
                      status === 'correct' && styles.optionLabelCorrect,
                      status === 'incorrect' && styles.optionLabelIncorrect,
                    ]}>
                      {status === 'correct' ? `✓ ${animal.nameId}` : '✗'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>
              {score >= MAX_ROUNDS * 8 ? '🏆' : score >= MAX_ROUNDS * 5 ? '🌟' : '💪'}
            </Text>
            <Text style={styles.modalTitle}>
              {score >= MAX_ROUNDS * 8 ? 'Sempurna!' : score >= MAX_ROUNDS * 5 ? 'Hebat!' : 'Terus Berlatih!'}
            </Text>
            <Text style={styles.modalDesc}>
              Skor: <Text style={styles.modalScore}>{score}</Text> dari {MAX_ROUNDS * 10}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={styles.modalBtnSecondary}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.modalBtnSecondaryText}>Menu</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnPrimary}
                onPress={startGame}
              >
                <Text style={styles.modalBtnPrimaryText}>Main Lagi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Intro styles
  introContainer: {
    flex: 1,
    backgroundColor: '#faf0e8',
  },
  introHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatShadow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  floatImg: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  mainChar: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCharImg: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 18,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a2a2a',
    marginBottom: 8,
  },
  introTitleAccent: {
    color: PRIMARY,
  },
  introDesc: {
    fontSize: 14,
    color: '#7a8a8a',
    lineHeight: 22,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },

  // Game styles
  gameContainer: {
    flex: 1,
    backgroundColor: '#faf0e8',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45,188,175,0.12)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a2a2a',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(45,188,175,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  gameBody: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  roundInfo: {
    fontSize: 13,
    color: '#7a8a8a',
    fontWeight: '600',
    marginBottom: 16,
  },
  shadowBox: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 200,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(45,188,175,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  shadowBoxCorrect: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderStyle: 'solid',
  },
  shadowBoxIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderStyle: 'solid',
  },
  shadowImg: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  resultCorrect: {
    color: '#16a34a',
  },
  resultIncorrect: {
    color: '#dc2626',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  optionCardWrap: {
    width: '48%',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  optionIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionImg: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  optionLabelCorrect: {
    color: '#16a34a',
  },
  optionLabelIncorrect: {
    color: '#dc2626',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  modalEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a2a2a',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 14,
    color: '#7a8a8a',
    marginBottom: 24,
  },
  modalScore: {
    fontWeight: '800',
    color: PRIMARY,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnSecondary: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  modalBtnPrimary: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
