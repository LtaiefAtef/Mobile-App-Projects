import { StyleSheet, Text, View , Image} from 'react-native'
import { Link } from 'expo-router';
import React from 'react'
import Logo from "../assets/img/logo_light.png"
const Home = () => {
  return (
    <View style={styles.container}>
      <Image source={Logo}/>
      <Text style={styles.title}>The Number 1</Text>
      <Text style={{marginTop:10,marginBottom:30}}>Reading List App</Text>
      <Link href="/about" style={styles.link}>About Page</Link>
      <Link href="/contact" style={styles.link}>Contact Page</Link>
    </View>
  )
}
export default Home

const styles = StyleSheet.create({ 
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  title:{
    fontWeight:"bold",
    fontSize:18
  },
  card:{
    backgroundColor:"#eeee",
    padding:20,
    borderRadius:5,
    boxShadow: "4px 4px rgba(0,0,0,0.1)"
  },
  link:{
    marginVertical:10,
    borderBottomWidth:1
    }
})