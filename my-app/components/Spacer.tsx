import { View, DimensionValue } from "react-native"

type SpacerProps = {
    width?:DimensionValue,
    height?:DimensionValue
}
const Spacer = ( { width="100%", height=40 } : SpacerProps ) => {
    return(
        <View style={{width,height}}/>
    )
}
export default Spacer;