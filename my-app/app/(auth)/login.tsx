import { StyleSheet} from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedText from '../../components/ThemedText'
import { Link } from 'expo-router'

const login = () => {
  return (
    <ThemedView style={styles.container}>
        <Spacer/>
        <ThemedText title={true} style={styles.title}>
            Login to Your Account
        </ThemedText>
        <Spacer height={100}/>
        <Link href="/register">
            <ThemedText style={{textAlign:"center"}}>
                Register instead
            </ThemedText>
        </Link>
    </ThemedView>
  )
}

export default login

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center"
    },
    title:{
        textAlign:"center",
        fontSize:18,
        marginBottom:30
    }
})