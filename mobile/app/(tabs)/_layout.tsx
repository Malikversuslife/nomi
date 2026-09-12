import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/tokens";

type IconName = "Home" | "Learn" | "Nomi" | "Practice" | "Progress";

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <View style={[styles.iconFrame, focused && styles.iconFrameFocused]}>{name === "Home" ? <HomeIcon color={color}/> : name === "Learn" ? <LearnIcon color={color}/> : name === "Nomi" ? <NomiIcon color={color}/> : name === "Practice" ? <PracticeIcon color={color}/> : <ProgressIcon color={color}/>}</View>;
}

function HomeIcon({ color }: { color: string }) {
  return <View style={styles.homeIcon}><View style={[styles.homeRoof,{borderColor:color}]}/><View style={[styles.homeBody,{borderColor:color}]}/></View>;
}

function LearnIcon({ color }: { color: string }) {
  return <View style={styles.bookIcon}><View style={[styles.bookPage,{borderColor:color}]}/><View style={[styles.bookPage,{borderColor:color}]}/><View style={[styles.bookSpine,{backgroundColor:color}]}/></View>;
}

function NomiIcon({ color }: { color: string }) {
  return <View style={[styles.nomiBlob,{backgroundColor:color}]}><View style={styles.nomiFace}><View style={styles.nomiEye}/><View style={styles.nomiEye}/></View></View>;
}

function PracticeIcon({ color }: { color: string }) {
  return <View style={styles.practiceIcon}><View style={[styles.pencilBody,{borderColor:color}]}/><View style={[styles.pencilTip,{borderTopColor:color}]}/></View>;
}

function ProgressIcon({ color }: { color: string }) {
  return <View style={styles.progressIcon}><View style={[styles.barSmall,{backgroundColor:color}]}/><View style={[styles.barMedium,{backgroundColor:color}]}/><View style={[styles.barTall,{backgroundColor:color}]}/></View>;
}

export default function TabLayout() {
  return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.primaryPurple,tabBarInactiveTintColor:colors.slate,tabBarLabelStyle:{fontSize:11,fontWeight:"700",marginBottom:2},tabBarItemStyle:{paddingTop:5},tabBarStyle:{backgroundColor:colors.white,borderTopColor:colors.stone,borderTopWidth:1,height:68,paddingTop:4},sceneStyle:{backgroundColor:colors.cream}}}>
    <Tabs.Screen name="index" options={{title:"Home",tabBarIcon:({color,focused})=><TabIcon name="Home" color={color} focused={focused}/>}}/>
    <Tabs.Screen name="learn" options={{title:"Learn",tabBarIcon:({color,focused})=><TabIcon name="Learn" color={color} focused={focused}/>}}/>
    <Tabs.Screen name="nomi" options={{title:"Nomi",tabBarIcon:({color,focused})=><TabIcon name="Nomi" color={color} focused={focused}/>}}/>
    <Tabs.Screen name="practice" options={{title:"Practice",tabBarIcon:({color,focused})=><TabIcon name="Practice" color={color} focused={focused}/>}}/>
    <Tabs.Screen name="progress" options={{title:"Progress",tabBarIcon:({color,focused})=><TabIcon name="Progress" color={color} focused={focused}/>}}/>
  </Tabs>;
}

const styles=StyleSheet.create({iconFrame:{alignItems:"center",height:28,justifyContent:"center",width:32},iconFrameFocused:{transform:[{scale:1.04}]},homeIcon:{height:22,width:22},homeRoof:{borderLeftWidth:2,borderTopWidth:2,height:15,left:3,position:"absolute",top:1,transform:[{rotate:"45deg"}],width:15},homeBody:{borderBottomWidth:2,borderLeftWidth:2,borderRightWidth:2,bottom:1,height:12,left:4,position:"absolute",width:14},bookIcon:{alignItems:"center",flexDirection:"row",height:19,justifyContent:"center",width:24},bookPage:{borderBottomWidth:2,borderLeftWidth:2,borderTopWidth:2,borderRadius:3,height:18,width:11},bookSpine:{height:16,width:2},nomiBlob:{alignItems:"center",borderRadius:10,height:22,justifyContent:"center",transform:[{rotate:"-3deg"}],width:24},nomiFace:{alignItems:"center",backgroundColor:colors.white,borderRadius:7,flexDirection:"row",gap:4,height:11,justifyContent:"center",width:16},nomiEye:{backgroundColor:colors.ink,borderRadius:2,height:5,width:3},practiceIcon:{height:23,width:23},pencilBody:{borderRadius:2,borderWidth:2,height:8,left:4,position:"absolute",top:7,transform:[{rotate:"-45deg"}],width:17},pencilTip:{borderLeftColor:"transparent",borderLeftWidth:4,borderRightColor:"transparent",borderRightWidth:4,borderTopWidth:6,bottom:2,height:0,position:"absolute",right:1,transform:[{rotate:"45deg"}],width:0},progressIcon:{alignItems:"flex-end",flexDirection:"row",gap:3,height:20,justifyContent:"center",width:24},barSmall:{borderRadius:2,height:7,width:4},barMedium:{borderRadius:2,height:12,width:4},barTall:{borderRadius:2,height:18,width:4}});