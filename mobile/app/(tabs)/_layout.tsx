import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { colors } from "@/theme/tokens";

type IconName = "Home" | "Learn" | "Nomi" | "Practice" | "Progress";

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  if (name === "Nomi") return <View style={[styles.iconFrame,focused&&styles.iconFrameFocused]}><NomiIcon color={color}/></View>;
  const iconName = name === "Home" ? "home" : name === "Learn" ? "learn" : name === "Practice" ? "practice" : "progress";
  return <View style={[styles.iconFrame,focused&&styles.iconFrameFocused]}><AppIcon name={iconName} color={color} size={23} strokeWidth={focused?2:1.7}/></View>;
}

function NomiIcon({ color }: { color: string }) {
  return <View style={[styles.nomiBlob,{backgroundColor:color}]}><View style={styles.nomiFace}><View style={styles.nomiEye}/><View style={styles.nomiEye}/></View></View>;
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

const styles=StyleSheet.create({iconFrame:{alignItems:"center",height:28,justifyContent:"center",width:32},iconFrameFocused:{transform:[{scale:1.04}]},nomiBlob:{alignItems:"center",borderRadius:10,height:22,justifyContent:"center",transform:[{rotate:"-3deg"}],width:24},nomiFace:{alignItems:"center",backgroundColor:colors.white,borderRadius:7,flexDirection:"row",gap:4,height:11,justifyContent:"center",width:16},nomiEye:{backgroundColor:colors.ink,borderRadius:2,height:5,width:3}});
