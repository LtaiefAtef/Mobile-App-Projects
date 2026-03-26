import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Contract } from "@/constants/appData";
import { useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
export default  function SecondStep(){
    const {contract} = useLocalSearchParams<{contract:string}>();
    const userContract : Contract = JSON.parse(contract);
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <ThemedView style={{ padding:15, width:"100%" }}>
                    <ThemedText style={{ marginBlock:10 }} type='subtitle'>Contract Info</ThemedText>
                    <ThemedView style={{margin:5}}>
                        <ThemedText>Client:</ThemedText>
                        <ThemedTextInput
                            editable={false}
                            darkColor="white" 
                            lightColor="black"
                            darkBackground="#3f3f3f54"
                            lightBackground="#ffffff"
                            animationDealy={250}
                            style={{borderRadius:0}}
                            value={userContract?.client}
                        />
                        <ThemedText>Driving License:</ThemedText>
                        <ThemedTextInput
                            editable={false}
                            darkColor="white"
                            lightColor="black"
                            darkBackground="#3f3f3f54"
                            lightBackground="#ffffff"
                            style={{borderRadius:0}}
                            animationDealy={300}
                            value={userContract?.drivingLicenseNumber}
                        />
                        <ThemedText>Vehicle Registration Number:</ThemedText>
                        <ThemedTextInput
                            editable={false}
                            darkColor="white"
                            lightColor="black"
                            style={{borderRadius:0}}
                            darkBackground="#3f3f3f54"
                            lightBackground="#ffffff"
                            animationDealy={300}
                            value={userContract?.registration}
                        />
                        <ThemedText>Insurance Company</ThemedText>
                        <ThemedTextInput
                            editable={false}
                            darkColor="white"
                            lightColor="black"
                            darkBackground="#3f3f3f54"
                            style={{borderRadius:0}}
                            lightBackground="#ffffff"
                            animationDealy={300}
                            value={userContract?.insuranceCompany}
                        />
                        <ThemedText>Car Brand</ThemedText>
                        <ThemedTextInput
                            editable={false}
                            darkColor="white"
                            lightColor="black"
                            darkBackground="#3f3f3f54"
                            lightBackground="#ffffff"
                            style={{borderRadius:0}}
                            animationDealy={300}
                            value={userContract?.brand}
                        />
                        <ThemedText>Car Accident:</ThemedText>
                            <ThemedTextInput
                                editable={false}
                                darkColor="white"
                                lightColor="black"
                                darkBackground="#3f3f3f54"
                                lightBackground="#ffffff"
                                style={{borderRadius:0}}
                                animationDealy={300}
                                value={new Date(userContract.accident_date!).toLocaleDateString()}
                            />
                    </ThemedView>
                    <ThemedButton style={{marginBlock:15}} textValue='Submit Claim' darkBackground='white' lightBackground='black' darkColor='black' lightColor='white' onPress={()=>{}}/>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
  }