import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

const TinderSwiper = ({ data = [] }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const [cardIndex, setCardIndex] = useState(0);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCardIndex((prev) => prev + 1);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const renderCards = () => {
    return data
      .map((item, i) => {
        if (i < cardIndex) return null;

        const isTopCard = i === cardIndex;
        const animatedStyle = isTopCard
          ? {
              transform: [...position.getTranslateTransform(), { rotate }],
            }
          : {
              transform: [{ scale: nextCardScale }],
            };

        return (
          <Animated.View
            key={item.id}
            style={[styles.card, animatedStyle, { zIndex: data.length - i }]}
            {...(isTopCard ? panResponder.panHandlers : {})}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.name}>{item.name}, {item.age}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
            {isTopCard && (
              <>
                <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
                  <Text style={styles.likeText}>LIKE</Text>
                </Animated.View>
                <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
                  <Text style={styles.nopeText}>NOPE</Text>
                </Animated.View>
              </>
            )}
          </Animated.View>
        );
      })
      .reverse();
  };
  return (
    <View style={styles.container}>
      {renderCards()}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => forceSwipe('left')}>
          <Icon name="close" size={32} color="#ec5288" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => forceSwipe('right')}>
          <Icon name="heart" size={32} color="#4ccc93" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TinderSwiper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 500,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 60,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  location: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
  },
  likeBadge: {
    position: 'absolute',
    top: 40,
    left: 20,
    borderColor: '#4ccc93',
    borderWidth: 3,
    padding: 10,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: '#4ccc93',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nopeBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    borderColor: '#ec5288',
    borderWidth: 3,
    padding: 10,
    borderRadius: 10,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: '#ec5288',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    position: 'absolute',
    bottom: 40,
  },
  button: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});
