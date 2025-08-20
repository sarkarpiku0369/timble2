import React, { useState, useRef, useEffect, useCallback } from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/StyleConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import API_ENDPOINTS from '../apiConfig';
import { widthPercentageToDP } from 'react-native-responsive-screen';

const ChatDetails = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // Keyboard is shown
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // Keyboard is hidden
      }
    );
  
    // Clean up function to remove listeners
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  // Get contact info from navigation params
  const contact = route.params?.contact;

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!contact?.id || !currentUser?.token) return;
    
    try {
      const response = await fetch(
        `${API_ENDPOINTS.RECEIVE_MESSAGE}/${contact.id}`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        // Clear interval if no messages found
        if (!result.data || result.data.length === 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return;
        }

        const formattedMessages = result.data.map(msg => ({
          id: String(msg.id),
          text: msg.message,
          fromMe: String(msg.sender_id) === String(currentUser.user_id),
          timestamp: msg.created_at,
          status: 'delivered'
        }));

        // Sort messages by timestamp (oldest first)
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );

        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [contact?.id, currentUser?.token, currentUser?.user_id]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    loadCurrentUser();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser && contact?.id) {
      fetchMessages();
      
      // Set up interval to fetch messages every 3 seconds
      intervalRef.current = setInterval(fetchMessages, 3000);
    }
  }, [currentUser, contact?.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = async () => {
    if (!messageInput.trim() || !currentUser || !contact?.id || isSending) return;
    
    // Create optimistic message
    const newMessage = {
      id: `temp_${Date.now()}`,
      text: messageInput.trim(),
      fromMe: true,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Add to messages immediately
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setIsSending(true);
    
    try {
      // Create the request body
      const requestBody = {
        message: messageInput.trim(),
        receiver_id: contact.id.toString()
      };

      const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
     if (result.success && result.data?.id) {
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { 
                  ...msg, 
                  id: result.data.id.toString(),
                  status: 'delivered'
                } 
              : msg
          ));
        } else {
          // Mark as failed if API didn't return expected data
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'failed' } 
              : msg
          ));
        }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status: 'failed' } 
          : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageStatus = (status) => {
  let iconName = "check";
  if (status === 'delivered') iconName = "check-all";
  else if (status === 'sending') iconName = "clock";
  else if (status === 'failed') iconName = "alert-circle";

  return (
    <Icon 
      name={iconName} 
      size={14} 
      color={COLORS.lightGray}
    />
  );
};

  return (
    <View style={[styles.container, { marginBottom: isKeyboardVisible ? hp("2.5%") : hp("0%") }]}>
      {/* Header */}
       <LinearGradient
      colors={['#ffffff', '#fff7eb']} // white → #fff7eb
   
    >  <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={30} color={COLORS.black} />
        </TouchableOpacity>
        
        <Image
          source={contact?.avatar 
            ? { uri: contact.avatar } 
            : require('../assets/images/logo.png')}
          style={styles.headerAvatar}
        />
        
        <View style={styles.headerText}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AuthFlow', {
              screen: 'Profile Details',
              params: { id: contact.id },
            })}
          >
          <Text style={styles.headerTitle}>
            {contact?.name || 'Unknown'}
          </Text>
          <Text style={styles.statusText}>
            {/* <Text>{JSON.stringify(contact, null, 2)}</Text> */}
         {contact?.status || 'Unknown'}
          </Text>
          </TouchableOpacity>
        </View>
      </View></LinearGradient>
    

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.fromMe ? styles.right : styles.left]}>
            {!item.fromMe && (
              <Image
                source={contact?.avatar 
                  ? { uri: contact.avatar } 
                  : require('../assets/images/logo.png')}
                style={styles.avatar}
              />
            )}
            <View style={[styles.bubble, item.fromMe ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={item.fromMe ? styles.messageTextRight : styles.messageText}>
                {item.text}
              </Text>

             <View style={styles.messageFooter}>
                <Text style={styles.timeText}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={styles.statusIconContainer}>
                  {item.fromMe && renderMessageStatus(item.status)}
                </View>
              </View>

            </View>
          </View>
        )}
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with {contact?.name || 'this contact'}</Text>
          </View>
        }
      />

      {/* Message Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Type a message ..."
          style={styles.input}
          placeholderTextColor={COLORS.gray}
          multiline
          editable={!isSending}
        />
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!messageInput.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Icon 
              name="send" 
              size={24} 
              color={messageInput.trim() ? COLORS.primary : COLORS.lightGray} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // paddingTop: 37
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: widthPercentageToDP('25%'),
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 8,
  },
  bubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '75%',
  },
  bubbleLeft: {
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: COLORS.yellow,
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.white,
  },
  messageTextRight: {
    fontSize: 14,
    color: COLORS.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.white,
  },
  statusIconContainer: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    borderColor: COLORS.cilver,
    borderWidth: 1,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default ChatDetails;