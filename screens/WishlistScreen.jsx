import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES } from '../constants/StyleConfig';
import BottomNavComponent from '../components/bottonCommon';
import { apiGet, apiPost } from '../utils/api';
import CommonHeader from '../components/CommonHeader';
import { heightPercentageToDP } from 'react-native-responsive-screen';

// ⚠️ Import your custom ConfirmModal component
import ConfirmModal from '../components/ConfirmModal'; // Adjust the path as needed
import { GlobalToast } from '../utils/GlobalToast';

const WishlistScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('likesMe');
  const [likesMeUsers, setLikesMeUsers] = useState([]);
  const [myLikesUsers, setMyLikesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ⚠️ State for the custom modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getLikesMeUsers = async () => {
    try {
      const result = await apiGet('liked-me');
      setLikesMeUsers(result.data.liked_me_users);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getMyLikesUsers = async () => {
    try {
      const res = await apiGet('my-likes');
      setMyLikesUsers(res.data.liked_customers || []);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // 🔄 Updated function to handle the modal display
  const handleRemoveLike = (userId) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  // 🚀 The actual function to remove the like
  const removeLikeConfirmed = async () => {
    setIsModalVisible(false); // Hide the modal

    try {
      const body = { liked_user_id: selectedUserId };
      const res = await apiPost('unlike', body);
      if (res.success) {
        GlobalToast.showSuccess(res.message, "User removed from likes.");
        // Alert.alert('Success', res.message || 'User removed from likes.');
        await getMyLikesUsers(); // 🔄 Reload data
      } else {
         GlobalToast.showError(res.message , "Failed to remove like.");
        // Alert.alert('Error', res.message || 'Failed to remove like.');
      }
    } catch (e) {
      console.log('Error:', e);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSelectedUserId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getLikesMeUsers(), getMyLikesUsers()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'likesMe') {
      await getLikesMeUsers();
    } else {
      await getMyLikesUsers();
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AuthFlow', {
          screen: 'Profile Details',
          params: { id: item.id },
        })
      }
      style={styles.card}
    >
      <ImageBackground
        source={{ uri: item?.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 20 }}
      >
        {activeTab === 'myLikes' && (
          <TouchableOpacity
            style={styles.deleteIconContainer}
            // ⚠️ Use the new handler here
            onPress={() => handleRemoveLike(item.id)}
          >
            <Icon name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(196, 6, 104, 0.7)']}
          style={styles.gradient}
        >
          <TouchableOpacity style={styles.profileDetails} onPress={() => navigation.navigate('AuthFlow', { screen: 'Profile Details' })}>
            <View style={styles.info}>
              <Text style={styles.name}>{capitalizeFirstLetter(item?.name || 'N/A')}</Text>
              <Text style={styles.type}>{item?.type || ''}</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const currentData = activeTab === 'likesMe' ? likesMeUsers : myLikesUsers;

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.likeMeContainer}
          onPress={async () => {
            setActiveTab('likesMe');
            setLoading(true);
            await getLikesMeUsers();
            setLoading(false);
          }}
        >
          <Text style={[styles.tab, activeTab === 'likesMe' && styles.activeTab]}>
            Likes me
          </Text>
          {likesMeUsers.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badge}>{likesMeUsers.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.myLikeContainer}
          onPress={async () => {
            setActiveTab('myLikes');
            setLoading(true);
            await getMyLikesUsers();
            setLoading(false);
          }}
        >
          <Text style={[styles.tab, activeTab === 'myLikes' && styles.activeTab]}>
            My Likes
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.scrollText}>Scroll up to see the likes</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : currentData.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.gray }}>
          No users found.
        </Text>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <BottomNavComponent navigation={navigation} tabName="LikesScreen" />

      {/* ⚠️ Add your custom modal component here */}
      <ConfirmModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onConfirm={removeLikeConfirmed}
      />
    </SafeAreaView>
  );
};

const CARD_WIDTH = Dimensions.get('window').width / 3 - 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderColor: COLORS.secondary,
    paddingBottom: 20,
  },
  likeMeContainer: {
    borderRightWidth: 0.3,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: SIZES.width * 0.5,
  },
  myLikeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SIZES.width * 0.5,
  },
  profileDetails: { top: 13 },
  tab: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray,
  },
  activeTab: {
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  badgeContainer: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingHorizontal: 6,
    marginLeft: 5,
    overflow: 'hidden',
  },
  badge: {
    color: COLORS.black,
    fontSize: 12,
  },
  scrollText: {
    textAlign: 'center',
    marginVertical: 8,
    color: COLORS.black,
    fontWeight: '300',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 'auto',
    alignSelf: 'flex-start',
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: heightPercentageToDP('20%'),
    justifyContent: 'flex-end',
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 5,
  },
  info: {
    position: 'absolute',
    bottom: 10,
    left: 2,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  type: {
    color: '#fff',
    fontSize: 13,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
});

export default WishlistScreen;