import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const cardsData = [
  {
    id: 1,
    name: 'Roth Roy',
    age: 23,
    location: 'Kolkata',
    distance: '1 km away',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    age: 25,
    location: 'Mumbai',
    distance: '2 km away',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=600&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 3,
    name: 'Alex Kumar',
    age: 27,
    location: 'Delhi',
    distance: '3 km away',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
    verified: false,
  },
];

const HomeScreen = () => {
  const [cards, setCards] = useState(cardsData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const superLikeScale = useRef(new Animated.Value(1)).current;

  const animateButton = (scaleRef) => {
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipeCard('right');
        } else if (gesture.dx < -120) {
          swipeCard('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const swipeCard = (direction) => {
    const toValue = direction === 'right' ? width : -width;

    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
    });
  };

  const handleLike = () => {
    animateButton(likeScale);
    swipeCard('right');
  };

  const handleDislike = () => {
    animateButton(dislikeScale);
    swipeCard('left');
  };

  const handleSuperLike = () => {
    animateButton(superLikeScale);
    Animated.timing(position, {
      toValue: { x: 0, y: -height },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
    });
  };

  const currentCard = cards[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {currentCard && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-width / 2, 0, width / 2],
                      outputRange: ['-10deg', '0deg', '10deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={{ uri: currentCard.image }} style={styles.cardImage} />

            {/* LIKE Tag */}
            <Animated.View
              style={[
                styles.likeTag,
                {
                  opacity: position.x.interpolate({
                    inputRange: [0, width / 3],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.tagText}>LIKE</Text>
            </Animated.View>

            {/* NOPE Tag */}
            <Animated.View
              style={[
                styles.nopeTag,
                {
                  opacity: position.x.interpolate({
                    inputRange: [-width / 3, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.tagText}>NOPE</Text>
            </Animated.View>

            <View style={styles.infoBox}>
              <Text style={styles.nameText}>
                {currentCard.name}, {currentCard.age}
              </Text>
              <Text style={styles.metaText}>
                📍 {currentCard.location} • {currentCard.distance}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Action Buttons with Press Effects */}
      <View style={styles.actionButtons}>
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <TouchableOpacity style={styles.button} onPress={handleDislike}>
            <Ionicons name="close" size={34} color="#FF4C61" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: superLikeScale }] }}>
          <TouchableOpacity style={styles.button} onPress={handleSuperLike}>
            <Ionicons name="star" size={34} color="#3B82F6" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity style={styles.button} onPress={handleLike}>
            <Ionicons name="heart" size={34} color="#22C55E" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCA30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.65,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metaText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  likeTag: {
    position: 'absolute',
    top: 40,
    left: 20,
    borderWidth: 4,
    borderColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  nopeTag: {
    position: 'absolute',
    top: 40,
    right: 20,
    borderWidth: 4,
    borderColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  tagText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
