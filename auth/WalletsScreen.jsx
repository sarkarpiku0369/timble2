import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalletsScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalHearts, setTotalHearts] = useState(0);
  const [userName, setUserName] = useState('');
   const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
  const init = async () => {
    await fetchTransactions();

    const tokenData = await AsyncStorage.getItem('userData');
    // setUserData(tokenData);
  };

  init();
}, []);


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');
      const token = user.token || '';

      const response = await fetch('https://webtechnomind.in/project/timble/api/get-transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const json = await response.json();

      if (json.success) {
        setTransactions(json.data || []);
        setTotalHearts(json.total_hearts || 0);
        setUserName(json.full_name || 'User');
        setProfileImage(json.profile_image);
        setUserData(json.gender);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const TransactionItem = ({ transaction }) => {
    const isPositive = transaction.type === 'sum';
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={styles.heartIconContainer}>
             <Image
            source={require('../assets/images/walletheart.png')}
           style={{ width: wp('8%'), resizeMode: 'contain' }}
          />
          
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>Heart</Text>
            <Text style={styles.transactionTime}>
              {new Date(transaction.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <View style={styles.amountContainer}>
            {isPositive ? (
               <Image
            source={require('../assets/images/top.png')}
           style={{ width: wp('8%'), resizeMode: 'contain' }}
          />
            ) : (
               <>
               
               <Image
            source={require('../assets/images/down.png')}
           style={{ width: wp('8%'), resizeMode: 'contain' }}
          />
               </>
            )}
            
            {/* <Icon
              name={isPositive ? 'arrow-down' : 'arrow-up'}
              size={wp(4)}
              color={isPositive ? '#4CAF50' : '#F44336'}
            /> */}
            <Text style={[
              styles.amount,
              // { color: isPositive ? '#4CAF50' : '#F44336' }
            ]}>
              {transaction.total_hearts}
            </Text>
          </View>
          <Icon name="chevron-forward" size={wp(5)} color="#C4C4C4" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
  <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

  {/* Header */}
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Icon name="chevron-back" size={wp(6)} color="#000" />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  </View>
  {/* <Text>{JSON.stringify(transactions, null, 2)}</Text> */}
  {/* User Info */}
  <View style={styles.userInfo}>
    <View style={styles.avatarContainer}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}><Text style={styles.avatarText}>{userName?.charAt(0)}</Text></View>
      )}
      {/* <View style={styles.onlineIndicator} /> */}
    </View>
    <View style={styles.userDetails}>
      {/* <Text style={styles.greeting}>Welcome back,</Text> */}
      <Text style={styles.userName}>Hello,</Text>
      <Text style={styles.userName}>{userName}</Text>
    </View>
    <View style={styles.walletInfo}>
      <View style={styles.walletView}>

    <Image
          source={require('../assets/images/wallet.png')}
          style={styles.wallet}
        />
      </View>
      <Text style={styles.walletText}>My Wallets</Text>
    </View>
  </View>

  {/* Wallet Card */}
  <View style={styles.mainView}>

  <ImageBackground
  source={require('../assets/images/heartshape.png')}
  style={styles.balanceCard}
  imageStyle={{ borderRadius: wp(5) }} // Apply border radius to image
>
  <View style={styles.flexHeart}>
  <Text style={styles.balanceLabel}>MAIN BAlANCE</Text>
  <Text style={styles.balanceAmount}>{totalHearts}</Text>

  {userData === "male" && (
    <TouchableOpacity
      style={styles.topUpButton}
      onPress={() => navigation.navigate('Calculate')}
    >
       <Image
            source={require('../assets/images/top.png')}
           style={{ width: wp('8%'), resizeMode: 'contain' }}
          />
      <Text style={styles.topUpText}>Top Up</Text>
    </TouchableOpacity>
  )}
</View>
</ImageBackground>
  </View>




  {/* Transactions Title */}
  <View style={styles.transactionsHeader}>
    <Text style={styles.transactionsTitle}>Latest Transactions</Text>
  </View>

  <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: hp(5) }}>
    {loading ? (
      <ActivityIndicator size="large" color="#FF69B4" />
    ) : transactions.length === 0 ? (
      <Text style={styles.emptyText}>No transactions found</Text>
    ) : (
      transactions.map((t) => <TransactionItem key={t.id} transaction={t} />)
    )}
  </ScrollView>
</SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   walletView: {
    width: 35,  // Fixed size for perfect circle
    height: 35, // Same as width
    borderRadius: 30, // Half of width/height for perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Background color of the circle
    position: 'relative',
    // External shadow (optional)
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android
  },

  
  // Inner shadow overlay
  innerShadowOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30, // Same as parent
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Inner shadow color
    top: 1,
    left: 1,
  },
  
  wallet: {
    width: 20,
    height: 20,
    zIndex: 1, // Ensure image is above the overlay
  },

  backText: {
    fontSize: wp(5),
    marginLeft: wp(1),
    color: '#000',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    //borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp("50%"),
    borderWidth: 3,
    borderColor: '#FFCA30',
    resizeMode: 'contain',
  },
  avatarText: {
    color: '#FFF',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3),
    height: wp(3),
    backgroundColor: '#4CAF50',
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: '#FFF',
  },
  userDetails: {
    flex: 1,
    marginLeft: wp(3),
  },
  greeting: {
    fontSize: wp(3.5),
    color: '#777',
  },
  userName: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
  },
  walletText: {
   fontWeight: 'bold'
  },
  flexHeart: {
   position: 'relative',
   top: 60
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  mainView: {
  alignItems: 'center',
  padding: 0
  },
  walletEmoji: {
    fontSize: wp(7),
  },
balanceCard: {
  width: 250,
  // marginBottom: hp('2%'),
  borderRadius: wp(5),
  padding: wp(6),
  alignItems: 'center',
  height: 190,
},
 
  balanceLabel: {
    fontSize: wp(4.5),
    color: '#000',
    fontWeight: 'bold',
    // marginBottom: hp(1),
    textAlign: 'center',
    marginTop: 5
  },
  balanceAmount: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: '#000',
    position: "relative",
    top:-6,
    textAlign: 'center',
   
  },
  topUpButton: {
    flexDirection: 'column',
    alignItems: 'center',
     position:"relative",
    top:-20,
  },
  topUpText: {
    color: '#000000ff',
    marginLeft: wp(0),
    fontSize: wp(3),
    lineHeight:wp(3),
    position:"relative",
    top:-8,
  },
  transactionsHeader: {
    paddingHorizontal: wp(5),
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  transactionsTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContainer: {
    paddingHorizontal: wp(5),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp(4),
    backgroundColor: '#fff',
    borderRadius: wp(7),
    marginBottom: hp(1),
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heartIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  heartIcon: {
    fontSize: wp(5),
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
  },
  transactionTime: {
    fontSize: wp(3),
    color: '#888',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(2),
  },
  amount: {
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp(5),
    color: '#999',
    fontSize: wp(4),
  },
});


export default WalletsScreen;
