import { Redirect, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/theme/tokens";

const goals = ["Build confidence", "Prepare for exams", "Stay ahead", "Learn something new"];
const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Languages"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, displayName } = useLearnerSession();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = useMemo(() => `${step + 1} / 3`, [step]);

  if (!user) return <Redirect href="/sign-in" />;
  const toggleSubject = (subject: string) => setSelectedSubjects(current => current.includes(subject) ? current.filter(item => item !== subject) : [...current, subject]);

  async function finish() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const { error: updateError } = await supabase.from("profiles").update({ grade_year: level.trim() || null }).eq("id", user!.id);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    router.replace("/(tabs)");
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
    <View style={styles.top}><Text style={styles.wordmark}>nomi</Text><Text style={styles.progress}>{progress}</Text></View>
    {step===0?<View style={styles.section}><Text style={styles.kicker}>HELLO{displayName?`, ${displayName.toUpperCase()}`:""}</Text><Text style={styles.title}>What are we learning for?</Text><Text style={styles.copy}>This gives Nomi a starting direction. Your actual practice will teach it much more.</Text><View style={styles.choices}>{goals.map(item=><Choice key={item} label={item} selected={goal===item} onPress={()=>setGoal(item)}/>)}</View></View>:null}
    {step===1?<View style={styles.section}><Text style={styles.kicker}>YOUR STARTING POINT</Text><Text style={styles.title}>Where are you learning right now?</Text><Text style={styles.copy}>Use your school year, level, course, or simply “self-learning”. You can change this later.</Text><TextInput value={level} onChangeText={setLevel} placeholder="e.g. Year 11, university, self-learning" placeholderTextColor={colors.slate} style={styles.input}/></View>:null}
    {step===2?<View style={styles.section}><Text style={styles.kicker}>BUILD YOUR SPACE</Text><Text style={styles.title}>What do you want to start with?</Text><Text style={styles.copy}>Choose more than one. Subjects are not permanent; your learning space can grow with you.</Text><View style={styles.choices}>{subjects.map(item=><Choice key={item} label={item} selected={selectedSubjects.includes(item)} onPress={()=>toggleSubject(item)}/>)}</View><Text style={styles.note}>Languages is included as a learning track. We’ll treat language skills differently from maths-style assessment.</Text></View>:null}
    {error?<Text style={styles.error}>{error}</Text>:null}
    <View style={styles.actions}>{step>0?<Pressable onPress={()=>setStep(value=>value-1)} style={styles.back}><Text style={styles.backText}>Back</Text></Pressable>:<View/>}<Pressable disabled={(step===0&&!goal)||(step===2&&!selectedSubjects.length)||saving} onPress={()=>step<2?setStep(value=>value+1):void finish()} style={[styles.next,((step===0&&!goal)||(step===2&&!selectedSubjects.length)||saving)&&styles.disabled]}><Text style={styles.nextText}>{step===2?(saving?"Setting up…":"Enter Nomi"):"Continue"}</Text></Pressable></View>
  </ScrollView></SafeAreaView>;
}

function Choice({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}){return <Pressable onPress={onPress} style={[styles.choice,selected&&styles.choiceSelected]}><Text style={[styles.choiceText,selected&&styles.choiceTextSelected]}>{label}</Text><Text style={[styles.choiceMark,selected&&styles.choiceTextSelected]}>{selected?"✓":"+"}</Text></Pressable>}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{flexGrow:1,justifyContent:"space-between",padding:spacing.lg,paddingBottom:spacing.xl},top:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},wordmark:{color:colors.primaryPurple,fontSize:30,fontWeight:"900",letterSpacing:-2},progress:{color:colors.slate,fontSize:11,fontWeight:"800"},section:{marginVertical:spacing.xl},kicker:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.4},title:{color:colors.ink,fontSize:38,fontWeight:"900",letterSpacing:-1.6,lineHeight:41,marginTop:spacing.sm,maxWidth:340},copy:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md,maxWidth:340},choices:{gap:10,marginTop:spacing.xl},choice:{alignItems:"center",backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,flexDirection:"row",justifyContent:"space-between",minHeight:58,paddingHorizontal:18},choiceSelected:{backgroundColor:colors.lavender,borderColor:colors.primaryPurple},choiceText:{color:colors.ink,fontSize:15,fontWeight:"800"},choiceTextSelected:{color:colors.primaryPurple},choiceMark:{color:colors.slate,fontSize:18,fontWeight:"900"},input:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,color:colors.ink,fontSize:15,marginTop:spacing.xl,minHeight:58,paddingHorizontal:18},note:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:spacing.md},error:{color:colors.ink,fontSize:12},actions:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginTop:spacing.lg},back:{padding:16},backText:{color:colors.slate,fontSize:14,fontWeight:"800"},next:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,justifyContent:"center",minHeight:54,minWidth:150,paddingHorizontal:24},nextText:{color:colors.white,fontSize:14,fontWeight:"900"},disabled:{opacity:.35}});