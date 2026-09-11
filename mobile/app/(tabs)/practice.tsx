import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useCurriculum } from "@/learn/useCurriculum";
import { isAcceptedAnswer, usePracticeQuestions } from "@/practice/usePracticeQuestions";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

const mascotBase = "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot";

export default function PracticeScreen() {
  const router=useRouter();
  const params=useLocalSearchParams<{topicId?:string;topicSlug?:string;topicName?:string;subjectId?:string;subjectName?:string}>();
  const {subject,currentTopic,loading:curriculumLoading,error:curriculumError}=useCurriculum("mathematics");
  const { recordSession, adaptivePractice, setActiveTopic, latestSession } = usePracticeProgress();
  const topicId=params.topicId??currentTopic?.id??null;
  const topicName=params.topicName??currentTopic?.name??"Practice";
  const subjectId=params.subjectId??subject?.id??null;
  const subjectName=params.subjectName??subject?.name??"Mathematics";
  const {questions,loading,error,reload}=usePracticeQuestions(topicId,adaptivePractice.difficulty);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer,setTextAnswer]=useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{setActiveTopic(topicId,topicName);},[setActiveTopic,topicId,topicName]);
  useEffect(()=>{setQuestionIndex(0);setSelected(null);setTextAnswer("");setChecked(false);setScore(0);setOutcomes([]);setAnswers([]);setComplete(false);},[topicId]);

  const question=questions[questionIndex];
  const learnerAnswer=question?.questionType==="short_answer"?textAnswer:selected??"";
  const isCorrect=Boolean(checked&&question&&isAcceptedAnswer(question,learnerAnswer));
  const progress=questions.length?`${((questionIndex+1)/questions.length)*100}%` as const:"0%" as const;
  const mascotUri = useMemo(() => complete ? `${mascotBase}/celebrating.png` : !checked ? `${mascotBase}/thinking.png` : isCorrect ? `${mascotBase}/encouraging.png` : `${mascotBase}/supportive.png`, [checked, complete, isCorrect]);
  const completedMastery=latestSession?.topic===topicName?latestSession.mastery:null;
  const topicMastered=completedMastery!==null&&completedMastery>=80;

  async function handlePrimaryAction() {
    if (!question || !learnerAnswer.trim() || saving) return;
    if (!checked) {
      const correct=isAcceptedAnswer(question,learnerAnswer);
      if (correct) setScore((current) => current + 1);
      setOutcomes((current) => [...current, correct]);
      setAnswers((current) => [...current, learnerAnswer]);
      setChecked(true);
      return;
    }
    if (questionIndex === questions.length - 1) {
      setSaving(true);
      await recordSession({
        subject:subjectName,subjectId:subjectId??undefined,topic:topicName,topicId:topicId??undefined,outcomes,difficulty:adaptivePractice.difficulty,
        attempts:questions.map((item,index)=>({prompt:item.prompt,learnerAnswer:answers[index]??"",expectedAnswer:item.expectedAnswer.accepted?.[0]??item.options.find(option=>option.id===item.expectedAnswer.option_id)?.label??"",isCorrect:outcomes[index]??false,questionType:item.questionType,conceptName:item.conceptName,misconceptionKey:item.misconceptionKey,misconceptionCategory:item.misconceptionCategory})),
      });
      setSaving(false); setComplete(true); return;
    }
    setQuestionIndex((current) => current + 1); setSelected(null); setTextAnswer(""); setChecked(false);
  }

  function restartSession() { setQuestionIndex(0); setSelected(null); setTextAnswer(""); setChecked(false); setScore(0); setOutcomes([]); setAnswers([]); setComplete(false); setSaving(false); }

  if(curriculumLoading||loading)return <SafeAreaView style={styles.safeArea}><View style={styles.centerState}><Image source={{uri:`${mascotBase}/thinking.png`}} style={styles.completionMascot}/><Text style={styles.completionTitle}>Building your practice set…</Text><Text style={styles.stateBody}>Nomi is matching canonical questions to your current difficulty.</Text></View></SafeAreaView>;
  if(curriculumError||error||!topicId||!question)return <SafeAreaView style={styles.safeArea}><View style={styles.centerState}><Text style={styles.completionEyebrow}>PRACTICE UNAVAILABLE</Text><Text style={styles.completionTitle}>This topic needs a question set.</Text><Text style={styles.stateBody}>{error??curriculumError??`No active assessed questions are available for ${topicName} yet.`}</Text><Pressable style={[styles.button,styles.retryButton]} onPress={()=>void reload()}><Text style={styles.buttonText}>Try again</Text></Pressable></View></SafeAreaView>;

  if (complete) return (
    <SafeAreaView style={styles.safeArea}><View style={styles.completionScreen}>
      <Image source={{ uri: mascotUri }} style={styles.completionMascot} resizeMode="contain" />
      <Text style={styles.completionEyebrow}>{topicMastered?"TOPIC MASTERED":"PRACTICE COMPLETE"}</Text><Text style={styles.completionTitle}>{topicMastered?`You mastered ${topicName}.`:`Nice work. You finished ${topicName}.`}</Text>
      <Text style={styles.completionScore}>{score} / {questions.length} correct{completedMastery!==null?` · ${completedMastery}/100 mastery`:""}</Text>
      <View style={styles.adaptiveCard}><Text style={styles.adaptiveEyebrow}>NOMI ADAPTED</Text><Text style={styles.adaptiveBody}>{topicMastered?"Your evidence crossed the mastery threshold. Return to Learn to see what unlocks next.":adaptivePractice.message}</Text></View>
      <Pressable style={[styles.button, styles.completionButton]} onPress={()=>router.replace("/(tabs)/learn")}><Text style={styles.buttonText}>{topicMastered?"See what’s next":"Back to Learn"}</Text></Pressable>
      <Pressable style={styles.secondaryCompletionButton} onPress={restartSession}><Text style={styles.secondaryCompletionButtonText}>Practice again</Text></Pressable>
    </View></SafeAreaView>
  );

  const expectedLabel=question.expectedAnswer.accepted?.[0]??question.options.find(option=>option.id===question.expectedAnswer.option_id)?.label??"the expected answer";

  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.eyebrow}>{subjectName.toUpperCase()} · {topicName.toUpperCase()}</Text><Text style={styles.progressText}>Question {questionIndex + 1} of {questions.length} · Level {question.difficulty}</Text></View><Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" /></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: progress }]} /></View>
      <View style={styles.questionBlock}><Text style={styles.prompt}>Assessed practice</Text><Text style={styles.expression}>{question.prompt}</Text><Text style={styles.helper}>{question.questionType==="multiple_choice"?"Choose the best answer.":"Type your answer, then let Nomi check it."}</Text></View>
      {question.questionType==="multiple_choice"?<View style={styles.answers}>{question.options.map((option) => { const active=selected===option.label; const correct=checked&&isAcceptedAnswer(question,option.label); const wrong=checked&&active&&!correct; return <Pressable key={option.id} disabled={checked} onPress={() => setSelected(option.label)} style={[styles.answer, active && styles.answerActive, correct && styles.answerCorrect, wrong && styles.answerWrong]}><Text style={[styles.answerText, active && styles.answerTextActive]}>{option.label}</Text></Pressable>; })}</View>:<TextInput editable={!checked} autoCapitalize="none" autoCorrect={false} value={textAnswer} onChangeText={setTextAnswer} placeholder="Type your answer" placeholderTextColor={colors.slate} style={[styles.input,checked&&(isCorrect?styles.answerCorrect:styles.answerWrong)]}/>} 
      {checked ? <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackRetry]}><Text style={styles.feedbackEyebrow}>{isCorrect ? "NICE WORK" : "ALMOST"}</Text><Text style={styles.feedbackTitle}>{isCorrect ? "That evidence moves you forward." : `The expected answer is ${expectedLabel}.`}</Text><Text style={styles.feedbackBody}>{question.explanation}</Text></View> : null}
      <Pressable disabled={!learnerAnswer.trim() || saving} onPress={() => void handlePrimaryAction()} style={[styles.button, (!learnerAnswer.trim() || saving) && styles.buttonDisabled]}><Text style={styles.buttonText}>{saving ? "Saving progress..." : checked ? (questionIndex === questions.length - 1 ? "Finish practice" : "Next question") : "Check answer"}</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:colors.cream},screen:{flexGrow:1,padding:spacing.lg,paddingBottom:spacing.xl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},headerCopy:{flex:1,paddingRight:spacing.sm},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.1},progressText:{color:colors.slate,fontSize:13,marginTop:5},mascot:{height:72,width:72},progressTrack:{backgroundColor:colors.stone,borderRadius:radius.pill,height:7,marginTop:spacing.md,overflow:"hidden"},progressFill:{backgroundColor:colors.mint,borderRadius:radius.pill,height:7},questionBlock:{marginTop:spacing.xl},prompt:{color:colors.primaryPurple,fontSize:12,fontWeight:"900",letterSpacing:.8,textTransform:"uppercase"},expression:{color:colors.ink,fontSize:30,fontWeight:"800",letterSpacing:-.7,lineHeight:38,marginTop:spacing.sm},helper:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.sm},answers:{gap:10,marginTop:spacing.xl},answer:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.md,borderWidth:2,paddingHorizontal:spacing.lg,paddingVertical:17},answerActive:{borderColor:colors.primaryPurple,backgroundColor:colors.lavender},answerCorrect:{borderColor:colors.mint,borderWidth:2},answerWrong:{borderColor:colors.pink,borderWidth:2},answerText:{color:colors.ink,fontSize:18,fontWeight:"700"},answerTextActive:{color:colors.primaryPurple},input:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.md,borderWidth:2,color:colors.ink,fontSize:18,fontWeight:"700",marginTop:spacing.xl,paddingHorizontal:spacing.lg,paddingVertical:16},feedback:{borderRadius:radius.md,marginTop:spacing.md,padding:spacing.md},feedbackCorrect:{backgroundColor:colors.lavender},feedbackRetry:{backgroundColor:colors.pink},feedbackEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},feedbackTitle:{color:colors.ink,fontSize:16,fontWeight:"800",lineHeight:21,marginTop:5},feedbackBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:4},button:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:"auto",paddingVertical:16},completionButton:{alignSelf:"stretch",marginTop:spacing.xl},retryButton:{alignSelf:"stretch",marginTop:spacing.xl},buttonDisabled:{opacity:.35},buttonText:{color:colors.white,fontSize:16,fontWeight:"800"},secondaryCompletionButton:{alignItems:"center",alignSelf:"stretch",borderColor:colors.primaryPurple,borderRadius:radius.pill,borderWidth:1,marginTop:10,paddingVertical:15},secondaryCompletionButtonText:{color:colors.primaryPurple,fontSize:15,fontWeight:"800"},completionScreen:{flex:1,alignItems:"center",justifyContent:"center",padding:spacing.xl},centerState:{flex:1,alignItems:"center",justifyContent:"center",padding:spacing.xl},completionMascot:{height:140,width:140,marginBottom:spacing.lg},completionEyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},completionTitle:{color:colors.ink,fontSize:30,fontWeight:"800",lineHeight:35,marginTop:spacing.sm,textAlign:"center"},completionScore:{color:colors.primaryPurple,fontSize:20,fontWeight:"900",marginTop:spacing.lg,textAlign:"center"},stateBody:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.md,textAlign:"center"},adaptiveCard:{alignSelf:"stretch",backgroundColor:colors.lavender,borderRadius:radius.md,marginTop:spacing.lg,padding:spacing.lg},adaptiveEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},adaptiveBody:{color:colors.ink,fontSize:14,fontWeight:"700",lineHeight:21,marginTop:6}
});