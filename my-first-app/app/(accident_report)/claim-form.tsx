import { ThemedPicker } from '@/components/themed-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { insuranceList, plateTypeList } from '@/constants/appData';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedButton } from '@/components/themed-button';
export default function App() {
  const [selectedInsurance, setSelectedInsurance] = useState<string|undefined>(undefined);
  const [selectedPlateType, setSelectedPlateType] = useState<string|undefined>(undefined);
  const [dateFrame, setDateFrame] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());

  const changeDate = (event: any, selectedDate?: Date | null) => {
    console.log("Date selected:", selectedDate);
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDateFrame(false);
  };
  return (
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
          <ThemedTextInput darkColor='white' lightColor='black' placeholder='Policy Number'/>
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
            onPress={() => {}} 
          />
        </ThemedView>}
    </ThemedView>
  );
} 

const styles = StyleSheet.create({
  container: {flex:1},
  label: { fontSize: 25, fontWeight: "bold", margin:20 },
  picker: { height: 50, width: '80%'},
  result: { marginTop: 16, fontSize: 16, color: 'gray' },
  text :{ fontSize: 16, marginLeft:15, borderBottomWidth:1, borderBottomColor:"gray", width:"70%", paddingBottom:10 }
});