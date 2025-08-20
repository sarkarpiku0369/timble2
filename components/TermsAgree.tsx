import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
// import CheckBox from '@react-native-community/checkbox';

const TermsAgree = () => {
  // const [toggleCheckBox, setToggleCheckBox] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.checkboxContainer}>
        {/* <CheckBox
          disabled={false}
          value={toggleCheckBox}
          onValueChange={(newValue) => setToggleCheckBox(newValue)}
        /> */}

        {/* Line - OR - Line */}
        <View style={styles.textContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>
      </View>

      <View>
        <Image
          source={require('../assets/images/google.png')}
          style={styles.group}
        />
      </View>
    </View>
  );
};

export default TermsAgree;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
  or: {
    marginHorizontal: 8,
    fontSize: 17,
    // fontWeight: '600',
    color: '#000',
  },
  group: {
    marginRight: 0,
    width: 40,
    height: 40,
  },
});
