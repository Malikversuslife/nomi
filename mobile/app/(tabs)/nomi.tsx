import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

type TutorAction = "practice"|"review"|"example"|"none";
type TutorMessage = { id:string; role:"user"|"assistant"; content:string; followUp?:string|null; suggestedAction?:TutorAction|null };
type TutorResult = { content:string; followUp?:string|null; suggestedAction?:TutorAction|null };

const tutorApiBase = process.env.EXPO_PUBLIC_NOMI_API_URL?.replace(/\/$/, "") ?? "";

function deterministicExample(topicName:string){
  const topic=topicName.toLowerCase();
  if(topic.includes("completing"))return "Take x² + 6x + 5. Half of 6 is 3, so build (x + 3)² = x² + 6x + 9. Because we added 9 instead of 5, subtract 4: x² + 6x + 5 = (x + 3)² - 4.";
  if(topic.includes("quadratic formula"))return "For x² - 5x + 6 = 0, a = 1, b = -5 and c = 6. The discriminant is 25 - 24 = 1, so x = (5 ± 1) / 2. The roots are 2 and 3.";
  return "Take x² + 5x + 6. Look for two numbers that multiply to 6 and add to 5: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3).";
}

function deterministicQuiz(topicName:string){
  const topic=topicName.toLowerCase();
  if(topic.includes("completing"))return {question:"Quick check: rewrite x² + 8x + 7 in completed-square form.",followUp:"What number goes inside the bracket after x?"};
  if(topic.includes("quadratic formula"))return {question:"Quick check: for 2x² + 3x - 2 = 0, what is the discriminant?",followUp:"Start with b² - 4ac. What values are a, b and c?"};
  return {question:"Quick check: factorise x² + 7x + 10 completely.",followUp:"Which two numbers multiply to 10 and add to 7?"};
}

function tutorReply(message:string, topicName:string, mastery:number, difficulty:number, misconception:ReturnType<typeof usePracticeProgress>["misconception"]):TutorResult{
  const text=message.toLowerCase();
  const context=misconception?misconception.message:`Your current ${topicName} mastery is ${mastery}/100 at difficulty ${difficulty}.`;
  if(text.includes("worked example")||text.includes("example"))return{content:`${context}\n\n${deterministicExample(topicName)}`,followUp:"Want to try one yourself?",suggestedAction:"practice"};
  if(text.includes("quiz")||text.includes("question")||text.includes("test")){const quiz=deterministicQuiz(topicName);return{content:`${context}\n\n${quiz.question}`,followUp:quiz.followUp,suggestedAction:"none"};}
  return{content:`${context}\n\n${deterministicExample(topicName)}`,followUp:"Want an example or a quick check?",suggestedAction:"example"};
}

export default function NomiScreen(){
  const router=useRouter();
  const{displayName}=useLearnerSession();
  const{mastery,misconception,adaptivePractice,latestSession,activeTopicName}=usePracticeProgress();
  const firstName=displayName?.split(" ")[0]??"there";
  const topicName=activeTopicName??latestSession?.topic??"Factorisation";
  const starters=useMemo(()=>[`Explain ${topicName} another way","Show me a worked example","Quiz me on the step I keep missing"],[topicName]);
  const[input,setInput]=useState("");
  const[messages,setMessages]=useState<TutorMessage[]>([]);
  const[sending,setSending]=useState(false);
  const[aiMode,setAiMode]=useState<"server"|"fallback"|"error"|null>(null);
  const[tutorError,setTutorError]=useState<string|null>(null);
  const contextLine=useMemo(()=>`${topicName} · ${mastery}/100 mastery · difficulty ${adaptivePractice.difficulty}${misconception?` · ${misconception.status} misconception`:" · no active misconception"}`,[topicName,mastery,adaptivePractice.difficulty,misconception]);

  async function getTutorResponse(message:string,currentMessages:TutorMessage[]):Promise<TutorResult>{
    setTutorError(null);
    if(!tutorApiBase){setAiMode("fallback");setTutorError("Tutor API URL is not configured. Using Nomi's deterministic local fallback.");return tutorReply(message,topicName,mastery,adaptivePractice.difficulty,misconception);}
    if(!supabase){setAiMode("fallback");setTutorError("Supabase client is not configured. Using Nomi's deterministic local fallback.");return tutorReply(message,topicName,mastery,adaptivePractice.difficulty,misconception);}
    const{data,error:sessionError}=await supabase.auth.getSession();
    const accessToken=data.session?.access_token;
    if(sessionError||!accessToken){setAiMode("fallback");setTutorError(sessionError?.message??"No authenticated tutor session is available. Using the local fallback.");return tutorReply(message,topicName,mastery,adaptivePractice.difficulty,misconception);}
    try{
      const transcript=currentMessages.slice(-12).map(item=>({role:item.role,content:item.role==="assistant"&&item.followUp?`${item.content}\n\nTutor follow-up question: ${item.followUp}`:item.content}));
      const response=await fetch(`${tutorApiBase}/api/mobile/tutor`,{method:"POST",headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},body:JSON.stringify({message,transcript})});
      const raw=await response.text();
      let payload:{ok?:boolean;message?:string;followUp?:string|null;suggestedAction?:TutorAction;error?:string}={};
      try{payload=raw?JSON.parse(raw):{};}catch{setAiMode("fallback");setTutorError(`Tutor API returned invalid JSON (${response.status}). Using the local fallback.`);return tutorReply(message,topicName,mastery,adaptivePractice.difficulty,misconception);}
      if(response.ok&&payload.ok&&payload.message){setAiMode("server");return{content:payload.message,followUp:payload.followUp,suggestedAction:payload.suggestedAction};}
      setAiMode("fallback");setTutorError(payload.error??payload.message??`Tutor API request failed with status ${response.status}. Using the local fallback.`);
    }catch(error){setAiMode("fallback");setTutorError(error instanceof Error?`${error.message} Using the local fallback.`:"Tutor API network request failed. Using the local fallback.");}
    return tutorReply(message,topicName,mastery,adaptivePractice.difficulty,misconception);
  }

  async function send(raw?:string){const message=(raw??input).trim();if(!message||sending)return;const userMessage:TutorMessage={id:`u-${Date.now()}`,role:"user",content:message};const current=[...messages,userMessage];setMessages(current);setInput("");setSending(true);const result=await getTutorResponse(message,current.slice(0,-1));setMessages(items=>[...items,{id:`a-${Date.now()+1}`,role:"assistant",content:result.content,followUp:result.followUp,suggestedAction:result.suggestedAction}]);setSending(false);}

  function actionLabel(action:TutorAction){if(action==="practice")return"Try assessed Practice";if(action==="review")return"Review the prerequisite";if(action==="example")return"Show me an example";return null;}

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>NOMI</Text><Text style={styles.title}>What should we work through, {firstName}?</Text><Text style={styles.description}>I’m carrying your active topic and learner evidence into this conversation, so you don’t have to explain where you are every time.</Text>
    <View style={styles.contextCard}><Text style={styles.cardEyebrow}>LEARNER CONTEXT</Text><Text style={styles.contextText}>{contextLine}</Text>{latestSession?<Text style={styles.contextMeta}>Latest practice: {latestSession.score}/{latestSession.total} correct · {latestSession.accuracy}% accuracy</Text>:null}<Text style={styles.modeNote}>{aiMode==="server"?"AI tutor connected":aiMode==="fallback"?"Using local tutor fallback":aiMode==="error"?"Tutor connection needs attention":"Tutor ready"}</Text>{tutorError?<Text style={styles.errorNote}>{tutorError}</Text>:null}</View>
    {messages.length===0?<View style={styles.starterCard}><Text style={styles.cardEyebrow}>START HERE</Text>{starters.map(item=><Pressable key={item} disabled={sending} onPress={()=>void send(item)} style={styles.starter}><Text style={styles.starterText}>{item}</Text></Pressable>)}</View>:null}
    {messages.length>0?<View style={styles.thread}>{messages.map(message=><View key={message.id} style={[styles.bubble,message.role==="user"?styles.userBubble:styles.nomiBubble]}><Text style={styles.bubbleLabel}>{message.role==="user"?"YOU":"NOMI"}</Text><Text style={[styles.bubbleText,message.role==="user"&&styles.userBubbleText]}>{message.content}</Text>{message.role==="assistant"&&message.followUp?<Pressable onPress={()=>void send(message.followUp!)} style={styles.followUp}><Text style={styles.followUpText}>{message.followUp}</Text></Pressable>:null}{message.role==="assistant"&&message.suggestedAction&&message.suggestedAction!=="none"?<Pressable onPress={()=>message.suggestedAction==="practice"?router.push("/(tabs)/practice"):void send(message.suggestedAction==="review"?"Help me review the prerequisite first":"Show me a worked example")} style={styles.actionChip}><Text style={styles.actionChipText}>{actionLabel(message.suggestedAction)}</Text></Pressable>:null}</View>)}{sending?<View style={[styles.bubble,styles.nomiBubble]}><Text style={styles.bubbleLabel}>NOMI</Text><Text style={styles.thinking}>Thinking with your learner context…</Text></View>:null}</View>:null}
    <View style={styles.composer}><TextInput editable={!sending} value={input} onChangeText={setInput} placeholder={`Ask Nomi about ${topicName}...`} placeholderTextColor={colors.slate} multiline style={styles.input}/><Pressable disabled={!input.trim()||sending} onPress={()=>void send()} style={[styles.sendButton,(!input.trim()||sending)&&styles.sendDisabled]}><Text style={styles.sendText}>Send</Text></Pressable></View>
    <Text style={styles.note}>Tutor conversation does not change mastery. Assessed Practice remains the evidence boundary.</Text>
    <Pressable onPress={()=>router.push("/(tabs)/practice")} style={styles.practiceButton}><Text style={styles.practiceButtonText}>Go to assessed Practice</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingTop:spacing.xl,paddingBottom:48},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.ink,fontSize:32,fontWeight:"800",letterSpacing:-1,lineHeight:37,marginTop:spacing.sm},description:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md},cardEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},contextCard:{backgroundColor:colors.lavender,borderRadius:radius.lg,marginTop:spacing.xl,padding:spacing.lg},contextText:{color:colors.ink,fontSize:17,fontWeight:"800",lineHeight:23,marginTop:10},contextMeta:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:7},modeNote:{color:colors.primaryPurple,fontSize:10,fontWeight:"800",marginTop:8},errorNote:{color:colors.ink,fontSize:11,lineHeight:16,marginTop:6},starterCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},starter:{backgroundColor:colors.cream,borderColor:colors.stone,borderRadius:radius.md,borderWidth:1,marginTop:10,paddingHorizontal:14,paddingVertical:14},starterText:{color:colors.ink,fontSize:14,fontWeight:"700"},thread:{gap:12,marginTop:spacing.md},bubble:{borderRadius:radius.lg,padding:spacing.md},userBubble:{alignSelf:"flex-end",backgroundColor:colors.primaryPurple,maxWidth:"86%"},nomiBubble:{alignSelf:"flex-start",backgroundColor:colors.white,maxWidth:"94%"},bubbleLabel:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1,marginBottom:6},bubbleText:{color:colors.ink,fontSize:14,lineHeight:21},userBubbleText:{color:colors.white},thinking:{color:colors.slate,fontSize:13,fontStyle:"italic"},followUp:{backgroundColor:colors.cream,borderRadius:radius.md,marginTop:12,padding:12},followUpText:{color:colors.ink,fontSize:13,fontWeight:"700"},actionChip:{alignSelf:"flex-start",borderColor:colors.primaryPurple,borderRadius:radius.pill,borderWidth:1,marginTop:10,paddingHorizontal:12,paddingVertical:8},actionChipText:{color:colors.primaryPurple,fontSize:12,fontWeight:"800"},composer:{alignItems:"flex-end",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",gap:10,marginTop:spacing.md,padding:10},input:{color:colors.ink,flex:1,fontSize:14,maxHeight:110,minHeight:44,paddingHorizontal:10,paddingVertical:11},sendButton:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,paddingHorizontal:18,paddingVertical:12},sendDisabled:{opacity:.35},sendText:{color:colors.white,fontSize:13,fontWeight:"800"},note:{color:colors.slate,fontSize:11,lineHeight:17,marginTop:spacing.md,textAlign:"center"},practiceButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.md,paddingVertical:15},practiceButtonText:{color:colors.white,fontSize:15,fontWeight:"800"}});