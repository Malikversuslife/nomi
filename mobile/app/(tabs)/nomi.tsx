import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

type TutorMessage = { id:string; role:"user"|"assistant"; content:string };

const starters = [
  "Explain Factorisation another way",
  "Show me a worked example",
  "Quiz me on the step I keep missing",
];

const tutorApiBase = process.env.EXPO_PUBLIC_NOMI_API_URL?.replace(/\/$/, "") ?? "";

function tutorReply(message:string, mastery:number, difficulty:number, misconception:ReturnType<typeof usePracticeProgress>["misconception"]){
  const text=message.toLowerCase();
  const context=misconception?.status==="recurring"?"You’ve had repeated difficulty choosing the greatest common factor, so I’ll make that step explicit.":misconception?.status==="improving"?"Your common-factor evidence is improving, so I’ll keep the support light.":misconception?.status==="resolved"?"That earlier common-factor pattern is resolved, so we can build forward from it.":`Your current mastery is ${mastery}/100 at difficulty ${difficulty}.`;
  if(text.includes("worked example")||text.includes("example")) return `${context}\n\nTry 18x + 30. First ask: what is the greatest number that divides both 18 and 30? It is 6. Then divide each term by 6: 18x ÷ 6 = 3x and 30 ÷ 6 = 5. So 18x + 30 = 6(3x + 5).\n\nThe key is to factor out the greatest common factor, not just any shared factor.`;
  if(text.includes("quiz")||text.includes("question")||text.includes("test")) return `${context}\n\nQuick check: factorise 24x + 36 completely.\n\nDon’t rush to an answer. First tell me the greatest common factor of 24 and 36.`;
  if(text.includes("another way")||text.includes("explain")||text.includes("factorisation")) return `${context}\n\nThink of Factorisation as packing terms into equal groups. In 12x + 16, both terms can be packed into groups of 4. Pull the 4 outside the brackets, then write what remains inside: 4(3x + 4).\n\nA useful question is: “What is the biggest factor every term can share?”`;
  if(text.includes("greatest")||text.includes("common factor")||text.includes("gcf")) return `${context}\n\nTo find the greatest common factor, list or recognise the factors shared by the coefficients, then choose the largest one. For 20 and 30, the shared factors include 1, 2, 5 and 10, so the greatest common factor is 10.`;
  return `${context}\n\nI’m following your Factorisation context. Ask me to explain a step, work through an example, or quiz you. I’ll keep the help aligned with your current learner state, and this conversation won’t change mastery unless you complete assessed Practice.`;
}

export default function NomiScreen(){
  const router=useRouter();
  const{displayName}=useLearnerSession();
  const{mastery,misconception,adaptivePractice,latestSession}=usePracticeProgress();
  const firstName=displayName?.split(" ")[0]??"there";
  const [input,setInput]=useState("");
  const [messages,setMessages]=useState<TutorMessage[]>([]);
  const [sending,setSending]=useState(false);
  const [aiMode,setAiMode]=useState<"server"|"fallback"|null>(null);
  const contextLine=useMemo(()=>`${mastery}/100 mastery · difficulty ${adaptivePractice.difficulty}${misconception?` · ${misconception.status} misconception`:" · no active misconception"}`,[mastery,adaptivePractice.difficulty,misconception]);

  async function getTutorResponse(message:string,currentMessages:TutorMessage[]){
    if(tutorApiBase&&supabase){
      const{data}=await supabase.auth.getSession();
      const accessToken=data.session?.access_token;
      if(accessToken){
        try{
          const response=await fetch(`${tutorApiBase}/api/mobile/tutor`,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify({message,transcript:currentMessages.slice(-12).map(item=>({role:item.role,content:item.content}))})});
          const payload=await response.json() as {ok?:boolean;message?:string};
          if(response.ok&&payload.ok&&payload.message){setAiMode("server");return payload.message;}
        }catch{}
      }
    }
    setAiMode("fallback");
    return tutorReply(message,mastery,adaptivePractice.difficulty,misconception);
  }

  async function send(raw?:string){
    const message=(raw??input).trim();
    if(!message||sending)return;
    const userMessage:TutorMessage={id:`u-${Date.now()}`,role:"user",content:message};
    const currentMessages=[...messages,userMessage];
    setMessages(currentMessages);setInput("");setSending(true);
    const content=await getTutorResponse(message,currentMessages.slice(0,-1));
    const response:TutorMessage={id:`a-${Date.now()+1}`,role:"assistant",content};
    setMessages(current=>[...current,response]);setSending(false);
  }

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>NOMI</Text><Text style={styles.title}>What should we work through, {firstName}?</Text><Text style={styles.description}>I’m carrying your learner context into this conversation, so you don’t have to explain where you are every time.</Text>

    <View style={styles.contextCard}><Text style={styles.cardEyebrow}>LEARNER CONTEXT</Text><Text style={styles.contextText}>{contextLine}</Text>{latestSession?<Text style={styles.contextMeta}>Latest practice: {latestSession.score}/{latestSession.total} correct · {latestSession.accuracy}% accuracy</Text>:null}{aiMode?<Text style={styles.modeNote}>{aiMode==="server"?"AI tutor connected":"Using local tutor fallback"}</Text>:null}</View>

    {messages.length===0?<View style={styles.starterCard}><Text style={styles.cardEyebrow}>START HERE</Text>{starters.map(item=><Pressable key={item} disabled={sending} onPress={()=>void send(item)} style={styles.starter}><Text style={styles.starterText}>{item}</Text></Pressable>)}</View>:null}

    {messages.length>0?<View style={styles.thread}>{messages.map(message=><View key={message.id} style={[styles.bubble,message.role==="user"?styles.userBubble:styles.nomiBubble]}><Text style={styles.bubbleLabel}>{message.role==="user"?"YOU":"NOMI"}</Text><Text style={[styles.bubbleText,message.role==="user"&&styles.userBubbleText]}>{message.content}</Text></View>)}{sending?<View style={[styles.bubble,styles.nomiBubble]}><Text style={styles.bubbleLabel}>NOMI</Text><Text style={styles.thinking}>Thinking with your learner context…</Text></View>:null}</View>:null}

    <View style={styles.composer}><TextInput editable={!sending} value={input} onChangeText={setInput} placeholder="Ask Nomi about Factorisation..." placeholderTextColor={colors.slate} multiline style={styles.input}/><Pressable disabled={!input.trim()||sending} onPress={()=>void send()} style={[styles.sendButton,(!input.trim()||sending)&&styles.sendDisabled]}><Text style={styles.sendText}>Send</Text></Pressable></View>
    <Text style={styles.note}>Tutor conversation does not change mastery. Assessed Practice remains the evidence boundary.</Text>
    <Pressable onPress={()=>router.push("/(tabs)/practice")} style={styles.practiceButton}><Text style={styles.practiceButtonText}>Go to assessed Practice</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingTop:spacing.xl,paddingBottom:48},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.ink,fontSize:32,fontWeight:"800",letterSpacing:-1,lineHeight:37,marginTop:spacing.sm},description:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md},cardEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},contextCard:{backgroundColor:colors.lavender,borderRadius:radius.lg,marginTop:spacing.xl,padding:spacing.lg},contextText:{color:colors.ink,fontSize:17,fontWeight:"800",lineHeight:23,marginTop:10},contextMeta:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:7},modeNote:{color:colors.primaryPurple,fontSize:10,fontWeight:"800",marginTop:8},starterCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},starter:{backgroundColor:colors.cream,borderColor:colors.stone,borderRadius:radius.md,borderWidth:1,marginTop:10,paddingHorizontal:14,paddingVertical:14},starterText:{color:colors.ink,fontSize:14,fontWeight:"700"},thread:{gap:12,marginTop:spacing.md},bubble:{borderRadius:radius.lg,padding:spacing.md},userBubble:{alignSelf:"flex-end",backgroundColor:colors.primaryPurple,maxWidth:"86%"},nomiBubble:{alignSelf:"flex-start",backgroundColor:colors.white,maxWidth:"94%"},bubbleLabel:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1,marginBottom:6},bubbleText:{color:colors.ink,fontSize:14,lineHeight:21},userBubbleText:{color:colors.white},thinking:{color:colors.slate,fontSize:13,fontStyle:"italic"},composer:{alignItems:"flex-end",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",gap:10,marginTop:spacing.md,padding:10},input:{color:colors.ink,flex:1,fontSize:14,maxHeight:110,minHeight:44,paddingHorizontal:10,paddingVertical:11},sendButton:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,paddingHorizontal:18,paddingVertical:12},sendDisabled:{opacity:.35},sendText:{color:colors.white,fontSize:13,fontWeight:"800"},note:{color:colors.slate,fontSize:11,lineHeight:17,marginTop:spacing.md,textAlign:"center"},practiceButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.md,paddingVertical:15},practiceButtonText:{color:colors.white,fontSize:15,fontWeight:"800"}});