import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 16px padding on each side + 12px gap
const API_BASE = 'https://kindergame.id';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Game {
  _id: string;
  name: string;
  slug: string;
  image: string;
  path: string;
  premium: boolean;
  isNew?: boolean;
  categories?: Category[];
}

interface GameCardProps {
  game: Game;
  isNew?: boolean;
}

// Native games map
const NATIVE_GAMES: Record<string, string> = {
  'shadow-match': 'ShadowMatch',
};

export default function GameCard({ game, isNew = false }: GameCardProps) {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Check if this game has a native implementation
    const nativeScreen = NATIVE_GAMES[game.slug];
    if (nativeScreen) {
      navigation.navigate(nativeScreen);
    } else {
      // Open game inside app using WebView
      const url = `${API_BASE}${game.path}`;
      navigation.navigate('GameWebView', {
        url,
        title: game.name,
      });
    }
  };

  const imageUri = game.image.startsWith('http') 
    ? game.image 
    : `${API_BASE}${game.image}`;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
        {game.premium && (
          <View style={styles.premiumBadge}>
            <Star size={10} color="#fff" fill="#fff" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{game.name}</Text>
        {game.categories && game.categories[0] && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{game.categories[0].name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 17,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,188,175,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2DBCAF',
  },
});
