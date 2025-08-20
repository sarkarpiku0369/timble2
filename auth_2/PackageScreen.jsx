import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
const PackagesScreen = () => {
  const navigation = useNavigation();
  const [selectedPackage, setSelectedPackage] = useState(2); // Default to Gold
  const scaleValue = new Animated.Value(1);

  const packages = [
    {
      id: 1,
      name: 'Silver',
      subtitle: 'Starter Pack',
      icon: '🥈',
      hearts: 1000,
      price: 9.99,
      originalPrice: 12.99,
      discount: 23,
      colors: {
        primary: '#E8E8E8',
        secondary: '#C0C0C0',
        accent: '#A8A8A8',
        text: '#2C2C2C'
      },
      features: ['1,000 Hearts', 'Basic Support', '30 Days Validity', 'Standard Features'],
      popular: false,
      savings: 3.00,
    },
    {
      id: 2,
      name: 'Gold',
      subtitle: 'Most Popular',
      icon: '👑',
      hearts: 5000,
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      colors: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF8C00',
        text: '#1A1A1A'
      },
      features: ['5,000 Hearts', 'Priority Support', '60 Days Validity', 'Premium Features', 'Bonus Rewards'],
      popular: true,
      savings: 10.00,
    },
    {
      id: 3,
      name: 'Diamond',
      subtitle: 'Ultimate Experience',
      icon: '💎',
      hearts: 15000,
      price: 49.99,
      originalPrice: 79.99,
      discount: 38,
      colors: {
        primary: '#E6F3FF',
        secondary: '#B8E6FF',
        accent: '#87CEEB',
        text: '#0D47A1'
      },
      features: ['15,000 Hearts', 'VIP Support 24/7', '120 Days Validity', 'Exclusive Features', 'Premium Badge', 'Special Rewards'],
      popular: false,
      savings: 30.00,
    },
  ];

  const handleSelectPackage = (packageItem) => {
    setSelectedPackage(packageItem.id);
    
    // Add selection animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePurchase = () => {
    const selected = packages.find(pkg => pkg.id === selectedPackage);
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${selected.name} package for $${selected.price}?\n\nYou'll get ${selected.hearts.toLocaleString()} hearts and save $${selected.savings.toFixed(2)}!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: () => Alert.alert('Success!', 'Package purchased successfully!') }
      ]
    );
  };

  const PackageCard = ({ packageItem, index }) => {
    const isSelected = selectedPackage === packageItem.id;
    
    return (
      <Animated.View
        style={[
          styles.packageCardWrapper,
          { 
            transform: [{ scale: isSelected ? scaleValue : 1 }],
            marginTop: packageItem.popular ? hp(2) : hp(1)
          }
        ]}
      >
        {packageItem.popular && (
          <View style={styles.popularBadge}>
            <Icon name="star" size={wp(3.5)} color="#FFF" />
            <Text style={styles.popularText}>BEST VALUE</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.packageCard, 
            { 
              backgroundColor: packageItem.colors.primary,
              borderColor: isSelected ? '#FF1744' : packageItem.colors.accent,
              borderWidth: isSelected ? wp(0.6) : wp(0.2),
              shadowColor: packageItem.colors.accent,
            }
          ]}
          onPress={() => handleSelectPackage(packageItem)}
          activeOpacity={0.9}
        >
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <View style={styles.selectedCheckmark}>
                <Icon name="checkmark" size={wp(4)} color="#FFF" />
              </View>
            </View>
          )}

          <View style={styles.packageHeader}>
            <View style={[styles.iconContainer, { backgroundColor: packageItem.colors.secondary }]}>
              <Text style={styles.packageIcon}>{packageItem.icon}</Text>
            </View>
            <Text style={[styles.packageName, { color: packageItem.colors.text }]}>{packageItem.name}</Text>
            <Text style={[styles.packageSubtitle, { color: packageItem.colors.text }]}>{packageItem.subtitle}</Text>
          </View>

          <View style={styles.heartsSection}>
            <View style={styles.heartsDisplay}>
              <Text style={styles.heartsIcon}>💖</Text>
              <Text style={[styles.heartsCount, { color: packageItem.colors.text }]}>
                {packageItem.hearts.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.heartsLabel, { color: packageItem.colors.text }]}>Hearts Included</Text>
          </View>

          <View style={styles.pricingSection}>
            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: packageItem.colors.text }]}>
                ${packageItem.price}
              </Text>
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPrice}>${packageItem.originalPrice}</Text>
                <View style={[styles.discountBadge, { backgroundColor: '#FF1744' }]}>
                  <Text style={styles.discountText}>{packageItem.discount}% OFF</Text>
                </View>
              </View>
            </View>
            <Text style={styles.savingsText}>Save ${packageItem.savings.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresSection}>
            <Text style={[styles.featuresTitle, { color: packageItem.colors.text }]}>What's Included:</Text>
            {packageItem.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.checkmarkContainer}>
                  <Icon name="checkmark-circle" size={wp(4)} color="#4CAF50" />
                </View>
                <Text style={[styles.featureText, { color: packageItem.colors.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity  onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={wp(6)} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>Unlock more hearts</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle-outline" size={wp(6)} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>💖 Get More Hearts</Text>
          {/* <Text style={styles.heroSubtitle}>Choose the perfect package to enhance your experience</Text> */}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {packages.map((packageItem, index) => (
          <PackageCard key={packageItem.id} packageItem={packageItem} index={index} />
        ))}
        
        <View style={styles.trustSection}>
          <View style={styles.trustRow}>
            <Icon name="shield-checkmark" size={wp(5)} color="#4CAF50" />
            <Text style={styles.trustText}>Secure Payment</Text>
          </View>
          <View style={styles.trustRow}>
            <Icon name="refresh" size={wp(5)} color="#4CAF50" />
            <Text style={styles.trustText}>30-Day Money Back</Text>
          </View>
          <View style={styles.trustRow}>
            <Icon name="people" size={wp(5)} color="#4CAF50" />
            <Text style={styles.trustText}>24/7 Customer Support</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Purchase Section */}
      <View style={styles.bottomSection}>
        <View style={styles.selectedPackageInfo}>
          <Text style={styles.selectedText}>Selected: {selectedPackageData?.name}</Text>
          <Text style={styles.selectedPrice}>${selectedPackageData?.price}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={handlePurchase}
          activeOpacity={0.8}
        >
          <Icon name="card" size={wp(5)} color="#FFF" />
          <Text style={styles.purchaseButtonText}>Continue to Payment</Text>
          <Icon name="arrow-forward" size={wp(4)} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By purchasing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: wp(2),
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: wp(3.2),
    color: '#666',
    marginTop: hp(0.2),
  },
  helpButton: {
    padding: wp(2),
  },
  heroSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: wp(6.5),
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  heroSubtitle: {
    fontSize: wp(3.8),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(5.5),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  packageCardWrapper: {
    marginBottom: hp(2),
  },
  popularBadge: {
    position: 'absolute',
    top: -hp(1.2),
    left: wp(6),
    right: wp(6),
    backgroundColor: '#FF1744',
    borderRadius: wp(4),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  popularText: {
    color: '#FFF',
    fontSize: wp(3.2),
    fontWeight: '700',
    marginLeft: wp(1),
    letterSpacing: wp(0.1),
  },
  packageCard: {
    borderRadius: wp(6),
    padding: wp(6),
    backgroundColor: '#FFF',
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    zIndex: 1,
  },
  selectedCheckmark: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1.5),
  },
  packageIcon: {
    fontSize: wp(8),
  },
  packageName: {
    fontSize: wp(5.5),
    fontWeight: '700',
    marginBottom: hp(0.5),
  },
  packageSubtitle: {
    fontSize: wp(3.5),
    fontWeight: '500',
    opacity: 0.8,
  },
  heartsSection: {
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  heartsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  heartsIcon: {
    fontSize: wp(6),
    marginRight: wp(2),
  },
  heartsCount: {
    fontSize: wp(7),
    fontWeight: '800',
  },
  heartsLabel: {
    fontSize: wp(3.2),
    fontWeight: '500',
    opacity: 0.7,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  currentPrice: {
    fontSize: wp(7),
    fontWeight: '800',
    marginRight: wp(3),
  },
  originalPriceContainer: {
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: wp(4),
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: hp(0.5),
  },
  discountBadge: {
    borderRadius: wp(2),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
  },
  discountText: {
    color: '#FFF',
    fontSize: wp(2.8),
    fontWeight: '700',
  },
  savingsText: {
    fontSize: wp(3.5),
    color: '#4CAF50',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: hp(2),
  },
  featuresSection: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: hp(1.5),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  checkmarkContainer: {
    marginRight: wp(3),
  },
  featureText: {
    fontSize: wp(3.5),
    fontWeight: '500',
    flex: 1,
  },
  trustSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp(4),
    padding: wp(5),
    marginTop: hp(2),
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  trustText: {
    fontSize: wp(3.5),
    color: '#555',
    marginLeft: wp(3),
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(3),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  selectedPackageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  selectedText: {
    fontSize: wp(4),
    color: '#666',
    fontWeight: '500',
  },
  selectedPrice: {
    fontSize: wp(5),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  purchaseButton: {
    backgroundColor: '#FF1744',
    borderRadius: wp(4),
    paddingVertical: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: wp(4.5),
    fontWeight: '700',
    marginHorizontal: wp(3),
  },
  termsText: {
    fontSize: wp(2.8),
    color: '#999',
    textAlign: 'center',
    lineHeight: wp(4),
  },
});

export default PackagesScreen;