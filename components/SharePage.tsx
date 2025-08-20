import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';

const SharePage = ({ profileId }: any) => {
  const handleShare = async () => {
    try {
      const shareUrl = `https://webtechnomind.in/project/timble/share.php?user_id=${profileId}`;
      const result = await Share.share({
        message: `Check out this profile on Timble: ${shareUrl}`,
        url: shareUrl, // iOS also supports url separately
        title: 'Share Timble Profile',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type
          console.log('Shared via', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleShare}>
        <Image
          source={require('../assets/images/share.png')}
          style={styles.share}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SharePage;

const styles = StyleSheet.create({
  share: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
});
