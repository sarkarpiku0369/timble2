import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const cardsData = [
  {
    id: 1,
    name: 'Roth Roy',
    age: 23,
    location: 'Kolkata',
    distance: '1 km away',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    age: 25,
    location: 'Mumbai',
    distance: '2 km away',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=600&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 3,
    name: 'Alex Kumar',
    age: 27,
    location: 'Delhi',
    distance: '3 km away',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
    verified: false,
  },
];

const HomeScreen = () => {
  const [cards, setCards] = useState(cardsData);
  const [currentIndex, setCurrentIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : prev));
    position.setValue({ x: 0, y: 0 });
  };

  const handleSwipe = (direction) => {
    const xVal = direction === 'right' ? width : -width;
    Animated.timing(position, {
      toValue: { x: xVal, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(handleNext);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          handleSwipe('right');
        } else if (gesture.dx < -120) {
          handleSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      {currentCard ? (
        <>
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
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={{ uri: currentCard.image }} style={styles.cardImage} />

            {/* LIKE overlay */}
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
              <Image
                source={require('../assets/images/like.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* NOPE overlay */}
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
              <Image
                source={require('../assets/images/nope.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </Animated.View>

            <View style={styles.cardInfo}>
              <Text style={styles.name}>
                {currentCard.name}, {currentCard.age}
              </Text>
              <Text style={styles.details}>📍 {currentCard.location} • {currentCard.distance}</Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleSwipe('left')} style={styles.circle}>
              <Icon name="times" size={30} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSwipe('right')} style={styles.circle}>
              <Icon name="heart" size={30} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.circle}>
              <Icon name="star" size={28} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.circle}>
              <Icon name="comment" size={26} color="#a855f7" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={{ fontSize: 20, color: '#fff' }}>No more cards</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.65,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'absolute',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  likeTag: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
  },
  nopeTag: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  details: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  actionRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 20,
  },
  circle: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    padding: 14,
    borderRadius: 50,
    elevation: 4,
  },
});

export default HomeScreen;
