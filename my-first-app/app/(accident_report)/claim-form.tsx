import { ThemedPicker } from '@/components/themed-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Contract, insuranceList, plateTypeList } from '@/constants/appData';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedButton } from '@/components/themed-button';
import { getUserContract } from '@/services/api';
export default function App() {
  const [selectedInsurance, setSelectedInsurance] = useState<string|undefined>(undefined);
  const [selectedPlateType, setSelectedPlateType] = useState<string|undefined>(undefined);
  const [contractNumber, setContractNumber] = useState<string|undefined>(undefined);
  const [dateFrame, setDateFrame] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [loading,setLoading] = useState<boolean|null>(null)
  const [userContract, setUserContract] = useState<Contract|null>(null);
  function ContractInfo(){
    return (
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
        </ThemedView>
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
        <ThemedButton style={{marginBlock:15}} textValue='Submit Claim' darkBackground='white' lightBackground='black' darkColor='black' lightColor='white' onPress={()=>{}}/>
    </ThemedView>
    );
  }
  const changeDate = (event: any, selectedDate?: Date | null) => {
    console.log("Date selected:", selectedDate);
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDateFrame(false);
  };
  // Getting user contract by number
  async function getContract() {
    setLoading(true);
    setTimeout(async() => {
          console.log("Getting user contract, Contract Number: "+ contractNumber);
          const userContractData = await getUserContract(contractNumber);
          if(userContractData.length!=0){
            setLoading(false);
            setUserContract(userContractData[0]);
          }
          console.log("User contract claim-form.tsx line 28",userContract);
    }, 3000);
  }
  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <ThemedText style={styles.label} darkColor='white' lightColor='black'>Search Vehicle</ThemedText>
            <ThemedPicker
                  items={insuranceList}
                  selectedValue={selectedInsurance}
                  onValueChange={(value) => {
                      setSelectedInsurance(value);
                  }}
              />
          {selectedInsurance && <ThemedView>
              <ThemedTextInput darkColor='white' lightColor='black' placeholder='Policy Number' onChangeText={setContractNumber}/>
              <ThemedText style={{margin:20, fontSize:16}}>Vehicle Registration Number</ThemedText>
              <ThemedView style={{display:"flex", flexDirection:"row", justifyContent:"space-between", width:"35%"}}>
                <ThemedTextInput darkColor='white' lightColor='black' placeholder=''/>
                <ThemedPicker 
                  items={plateTypeList}
                  selectedValue={selectedPlateType}
                  onValueChange={(value) => {
                      setSelectedPlateType(value);
                  }}
                />
                <ThemedTextInput darkColor='white' lightColor='black' placeholder=''/>
              </ThemedView>
                {dateFrame &&
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date" // Can be 'date', 'time', or 'datetime'
                    is24Hour={true}
                    display="default"
              onChange={changeDate}
              />}
              <ThemedText style={{margin:20}}>Accident Date</ThemedText>
              <ThemedText style={styles.text} darkColor='white' lightColor='black' onPress={()=>setDateFrame(!dateFrame)} >{date.toDateString()}</ThemedText>
              <ThemedButton textValue="Search Vehicle" 
                darkColor='black' 
                lightColor='white' 
                darkBackground="white" 
                lightBackground="black"
                ViewStyle={{marginTop:30, width:"100%"}}
                onPress={() => {getContract()}} 
              />
            </ThemedView>}
            {loading && <ThemedView><ThemedText type='subtitle'>Loading ...</ThemedText></ThemedView>}
            {loading == false && <ContractInfo/> }
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 

const styles = StyleSheet.create({
  container: {flex:1},
  label: { fontSize: 25, fontWeight: "bold", margin:20 },
  picker: { height: 50, width: '80%'},
  result: { marginTop: 16, fontSize: 16, color: 'gray' },
  text :{ fontSize: 16, marginLeft:15, borderBottomWidth:1, borderBottomColor:"gray", width:"70%", paddingBottom:10 }
});