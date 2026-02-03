import { Text, TextStyle, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import React from 'react'
type Props ={
    style?:TextStyle,
    title?:boolean,
    children?:React.ReactNode
}
const ThemedText = ({ style, title=false, ...props } : Props) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const textColor = title ? theme.title:theme.text;
  return (
      <Text style={[{color:textColor},style]} {...props}/>
  )
}

export default ThemedText