// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Alert,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import API_ENDPOINTS from '../apiConfig';

// const InterestModal = ({setInterestCategories , interestCategories}: any) => {
//   const [token, setUsertoken] = useState('');
 
//   const [interestsModalVisible, setInterestsModalVisible] = useState(false);
//   const [selectedInterestMap, setSelectedInterestMap] = useState({});

//   useEffect(() => {
//     const loadUserData = async () => {
//       try {
//         const stored = await AsyncStorage.getItem('userData');
//         if (stored) {
//           const user = JSON.parse(stored);
//           setUsertoken(user.token || '');
//         }
//       } catch (e) {
//         console.error("Failed to load user data", e);
//       }
//     };
//     loadUserData();
//   }, []);

//   useEffect(() => {
//     const fetchInterestsData = async () => {
//       if (!token) {
//         Alert.alert("Authentication Error", "No token found. Please login again.");
//         return;
//       }
//       try {
//         const response = await fetch(API_ENDPOINTS.GET_INTERESTS_DETAILS, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,
//           },
//         });

//         const data = await response.json();
//         if (data.success) {
//           setInterestCategories(data.data);
//         } else {
//           Alert.alert("Error", "Failed to fetch interests data.");
//         }
//       } catch (error) {
//         console.error(error);
//         Alert.alert("Error", "Something went wrong.");
//       }
//     };

//     if (token) {
//       fetchInterestsData();
//     }
//   }, [token]);

//   const handleSaveInterests = () => {
//     // Add save logic here
//     setInterestsModalVisible(false);
//   };

//   return (
//     <View>
//         <Text onPress={() => setInterestsModalVisible(true)} style={styles.editText}>Edit</Text>

//       <Modal
//         visible={interestsModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setInterestsModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Interests</Text>
//               <TouchableOpacity onPress={() => setInterestsModalVisible(false)}>
//                 <Text style={styles.closeIcon}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={{ maxHeight: 350 }}>
//               {interestCategories.map((category, catIndex) => (
//                 <View key={catIndex} style={{ marginBottom: 20 }}>
//                   <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
//                     {category.name}
//                   </Text>
//                   <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                     {category.details.map((item, itemIndex) => {
//                       const isSelected = selectedInterestMap[category.id]?.includes(item.id) || false;

//                       return (
//                         <TouchableOpacity
//                           key={itemIndex}
//                           style={[
//                             styles.hobbyTag,
//                             { backgroundColor: isSelected ? '#F93CA6' : '#eee' },
//                           ]}
//                           onPress={() => {
//                             setSelectedInterestMap(prev => {
//                               const catId = category.id;
//                               const current = prev[catId] || [];
//                               const updated = isSelected
//                                 ? current.filter(id => id !== item.id)
//                                 : [...current, item.id];

//                               const result = { ...prev, [catId]: updated };
//                               if (result[catId].length === 0) delete result[catId];
//                               return { ...result };
//                             });
//                           }}
//                         >
//                           <Text style={{
//                             color: isSelected ? '#fff' : '#333',
//                             fontWeight: '500',
//                           }}>
//                             {item.title}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 </View>
//               ))}
//             </ScrollView>

//             <TouchableOpacity style={styles.closeButton} onPress={handleSaveInterests}>
//               <Text style={styles.closeButtonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//   flex: 1,
//   justifyContent: 'flex-end', // push modal to bottom
//   backgroundColor: 'rgba(0,0,0,0.5)',
// },
// modalContent: {
//   backgroundColor: '#fff',
//   borderTopLeftRadius: 16,
//   borderTopRightRadius: 16,
//   padding: 16,
//   maxHeight: '80%' // optional: limit height so it doesn't cover screen fully
// },
// editText: {
//     fontSize: wp('4.5%'),
//     color: '#E91E63',
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold'
//   },
//   closeIcon: {
//     fontSize: 20,
//     color: '#333'
//   },
//   hobbyTag: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//     marginBottom: 8
//   },
//   closeButton: {
//     backgroundColor: '#F93CA6',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     alignItems: 'center'
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold'
//   }
// });

// export default InterestModal;
