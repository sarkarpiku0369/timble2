import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import LayoutBackImage from "../components/layoutBackImage";
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import CommonDropdown from "../components/commonDropdown";
import { SIZES, FONTS, COLORS } from "../constants/StyleConfig";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Slider from '@react-native-community/slider';
import BottonCommon from '../components/bottonCommon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';

const MatchPreferences = ({ navigation }) => {
    const [relationshipOptions, setRelationshipOptions] = useState([]);
    const [sexualityOptions, setSexualityOptions] = useState([]);
    const [genderOptions, setGenderOptions] = useState([]);
    const [bodyTypeOptions, setBodyTypeOptions] = useState([]);
    const [range, setRange] = useState([18, 50]);
    const [distance, setDistance] = useState(50);

    useEffect(() => {
        const loadUserDataAndFetch = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                let token = '';
                if (stored) {
                    const user = JSON.parse(stored);
                    token = user.token || '';
                }

                const response = await fetch(API_ENDPOINTS.PREFERENCE_GETDATA, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();
                if (json.success) {
                    json.data.forEach(item => {
                        switch (item.name) {
                            case "Relationship Goal":
                                setRelationshipOptions(item.details.map(detail => ({ label: detail.title, value: detail.title })));
                                break;
                            case "Sexuality type":
                                setSexualityOptions(item.details.map(detail => ({ label: detail.title, value: detail.title })));
                                break;
                            case "Gender Preference":
                                setGenderOptions(item.details.map(detail => ({ level: detail.title, fieldValue: detail.title, checkStatus: false })));
                                break;
                            case "Body Type Preference":
                                setBodyTypeOptions(item.details.map(detail => ({ level: detail.title, fieldValue: detail.title, checkStatus: false })));
                                break;
                            default:
                                break;
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to load user data or fetch preferences", e);
            }
        };
        loadUserDataAndFetch();
    }, []);

    const handleToggle = (index, type) => {
        if (type === 'gender') {
            const updated = [...genderOptions];
            updated[index].checkStatus = !updated[index].checkStatus;
            setGenderOptions(updated);
        } else if (type === 'bodyType') {
            const updated = [...bodyTypeOptions];
            updated[index].checkStatus = !updated[index].checkStatus;
            setBodyTypeOptions(updated);
        }
    };

    return (
      <LayoutBackImage>
        <View style={{ height: SIZES.height * 0.25 }} />
                <View style={{ marginLeft: 20, marginBottom: 20, marginTop: 60 }}>
                    <Text style={{ ...FONTS.h1, fontWeight: 'bold' }}>Your Match</Text>
                    <Text style={{ ...FONTS.h1, fontWeight: 'bold' }}>Preferences</Text>
                </View>
            <ScrollView style={{ flex: 1 }}>
                
                <View style={{ marginBottom: 10, marginHorizontal: 20 }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Relationship Goal</Text>
                    </View>
                    <CommonDropdown options={relationshipOptions} />
                </View>
                <View style={{ marginBottom: 20, marginHorizontal: 20 }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Sexuality type</Text>
                    </View>
                    <CommonDropdown options={sexualityOptions} />
                </View>
            <View style={{ marginHorizontal: 20, justifyContent: 'center' }}>
  <View style={{ marginVertical: 10 }}>
    <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Age Range</Text>
  </View>
  <View style={{ 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: COLORS.yellow, 
    borderRadius: 12, 
    shadowColor: COLORS.secondary, 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 8, 
    elevation: 6,
    paddingHorizontal: 15,
    paddingVertical: 10
  }}>
    <View style={{ marginVertical: 5, minWidth: 25 }}>
      <Text style={{ ...FONTS.h5, fontWeight: 'bold', textAlign: 'center' }}>{range[0]}</Text>
    </View>
    <View style={{ flex: 1, marginHorizontal: 5, overflow: 'hidden' }}>
      <MultiSlider
        containerStyle={{ 
          width: '90%', 
          alignSelf: 'center',
          height: 40
        }}
        trackStyle={{ height: 4 }}
        values={range}
        min={18}
        max={100}
        step={1}
        onValuesChange={setRange}
        selectedStyle={{ backgroundColor: COLORS.secondary }}
        unselectedStyle={{ backgroundColor: COLORS.white }}
        markerStyle={{ backgroundColor: COLORS.secondary, width: 20, height: 20 }}
      />
    </View>
    <View style={{ marginVertical: 5, minWidth: 25 }}>
      <Text style={{ ...FONTS.h5, fontWeight: 'bold', textAlign: 'center' }}>{range[1]}</Text>
    </View>
  </View>
</View>
                <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Gender Preference</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.yellow, borderRadius: 12, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                            {genderOptions.map((item, index) => (
                                <TouchableOpacity key={index} style={[{ backgroundColor: COLORS.white, height: 40, width: SIZES.width * .25, justifyContent: "center", alignItems: "center", borderRadius: 20, marginVertical: 8 }, item.checkStatus && { backgroundColor: COLORS.secondary }]} onPress={() => handleToggle(index, 'gender')}>
                                    <Text style={[{
        fontSize: wp("4%"),
        fontWeight: 'bold'
    }, item.checkStatus && { color: COLORS.white }]}> {item.level.length > 7 ? item.level.substring(0, 7) + '...' : item.level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
                <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Body Type Preference</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.yellow, borderRadius: 12, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                            {bodyTypeOptions.map((item, index) => (
    <TouchableOpacity 
        key={index} 
        style={[
            { 
                backgroundColor: COLORS.white, 
                height: 40, 
                width: SIZES.width * .25, 
                justifyContent: "center", 
                alignItems: "center", 
                borderRadius: 20, 
                marginVertical: 8 
            }, 
            item.checkStatus && { backgroundColor: COLORS.secondary }
        ]} 
        onPress={() => handleToggle(index, 'bodyType')}
    >
       <Text style={[
    {
        fontSize: wp("4%"),
        fontWeight: 'bold'
    },
    item.checkStatus && { color: COLORS.white }
]}>
    {item.level.length > 7 ? item.level.substring(0, 7) + '...' : item.level}
</Text>
    </TouchableOpacity>
))}
                        </View>
                    </View>
                </View>
                <View style={{ marginHorizontal: 20, justifyContent: 'center' }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ ...FONTS.h5, fontWeight: 'bold' }}>Distance Preference {distance}</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.yellow, borderRadius: 12, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 }}>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={distance}
                            onValueChange={setDistance}
                            minimumTrackTintColor={COLORS.secondary}
                            maximumTrackTintColor={COLORS.white}
                            thumbTintColor={COLORS.secondary}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginBottom: 20 }}>
                <BottonCommon handleSubmit={() => navigation.navigate('Addpics')} label="Continue" />
            </View>
        </LayoutBackImage>
    );
};

export default MatchPreferences;
