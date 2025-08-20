import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  useColorScheme 
} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
    const scheme = useColorScheme(); // 'light' or 'dark'
  const scrollViewRef = useRef(null);

  const screens = [
    {
      id: 1,
      title: '',
      image: require('../assets/images/onboarding.webp'),
    },
    {
      id: 2,
      title: '',
      image: require('../assets/images/onboarding2.png'),
    },
    {
      id: 3,
      title: 'Start Engaging',
      image: require('../assets/images/onboarding3.jpg'),
    },
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleGetStarted = () => {
    navigation.navigate('AuthFlow');
  };

  const handleSkip = () => {
    navigation.navigate('AuthFlow', { screen: 'Login' });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <StatusBar
      backgroundColor={scheme === 'dark' ? '#000000' : '#ffffff'}
      barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
    />
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
        >
          {screens.map((screen) => (
            <View key={screen.id} style={styles.screen}>
              <Image
                source={screen.image}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
              <View style={styles.contentOverlay}>
                <Text style={styles.screenTitle}>{screen.title}</Text>

                {screen.id === 3 && (
                  <TouchableOpacity
                    onPress={handleGetStarted}
                    style={styles.getStartedButton}
                  >
                    <Text style={styles.getStartedText}>Get Started</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {screens.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#FFCA30',
  },
  scrollView: {
    flex: 1,
  },
  screen: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: screenHeight * 0.08, // 15% from bottom
  },
  screenTitle: {
    fontSize: screenWidth * 0.08, // responsive font size
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 0,
  },
  getStartedButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: screenWidth * 0.15,
    paddingVertical: screenHeight * 0.02,
    borderRadius: 25,
    marginTop: screenHeight * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedText: {
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
    color: '#333',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: screenHeight * 0.04,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default WelcomeScreen;
