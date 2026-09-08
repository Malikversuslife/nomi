import { useMemo, useState } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

const mascotBase = "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot";

type Question = { expression: string; answers: string[]; correctAnswer: string; explanation: string; difficulty: number };

const questionBank: Question[] = [
  { expression: "4x + 8", answers: ["2(x + 4)", "4(x + 2)", "8(x + 1)", "4(x + 4)"], correctAnswer: "4(x + 2)", explanation: "4 is common to both 4x and 8, so 4x + 8 = 4(x + 2).", difficulty: 2 },
  { expression: "6x + 18", answers: ["3(2x + 6)", "6(x + 3)", "6(x + 12)", "2(3x + 18)"], correctAnswer: "6(x + 3)", explanation: "6 is the greatest common factor of 6x and 18.", difficulty: 2 },
  { expression: "10x + 25", answers: ["5(2x + 5)", "10(x + 15)", "5(x + 20)", "25(x + 1)"], correctAnswer: "5(2x + 5)", explanation: "Both terms divide evenly by 5, and no larger common factor works.", difficulty: 3 },
  { expression: "12x + 16", answers: ["2(6x + 8)", "4(3x + 4)", "8(x + 2)", "4(3x + 12)"], correctAnswer: "4(3x + 4)", explanation: "The greatest common factor of 12 and 16 is 4.", difficulty: 3 },
  { expression: "15x + 20", answers: ["5(3x + 4)", "10(1.5x + 2)", "5(3x + 15)", "15(x + 5)"], correctAnswer: "5(3x + 4)", explanation: "5 is the greatest factor shared by 15x and 20.", difficulty: 3 },
  { expression: "18x + 30", answers: ["3(6x + 10)", "6(3x + 5)", "9(2x + 3)", "6(3x + 24)"], correctAnswer: "6(3x + 5)", explanation: "6 is the greatest common factor of 18 and 30.", difficulty: 4 },
  { expression: "24x + 36", answers: ["6(4x + 6)", "12(2x + 3)", "4(6x + 9)", "12(2x + 24)"], correctAnswer: "12(2x + 3)", explanation: "12 is the greatest common factor of 24 and 36.", difficulty: 4 },
];

export default function PracticeScreen() {
  const { recordSession, adaptivePractice } = usePracticeProgress();
  const questions = useMemo(() => {
    const ranked = [...questionBank].sort((a, b) => Math.abs(a.difficulty - adaptivePractice.difficulty) - Math.abs(b.difficulty - adaptivePractice.difficulty));
    return ranked.slice(0, 5);
  }, [adaptivePractice.difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = questions[questionIndex];
  const isCorrect = checked && selected === question.correctAnswer;
  const progress = `${((questionIndex + 1) / questions.length) * 100}%` as const;
  const mascotUri = useMemo(() => complete ? `${mascotBase}/celebrating.png` : !checked ? `${mascotBase}/thinking.png` : isCorrect ? `${mascotBase}/encouraging.png` : `${mascotBase}/supportive.png`, [checked, complete, isCorrect]);

  async function handlePrimaryAction() {
    if (!selected || saving) return;
    if (!checked) {
      const correct = selected === question.correctAnswer;
      if (correct) setScore((current) => current + 1);
      setOutcomes((current) => [...current, correct]);
      setAnswers((current) => [...current, selected]);
      setChecked(true);
      return;
    }
    if (questionIndex === questions.length - 1) {
      setSaving(true);
      await recordSession({
        subject: "Mathematics", topic: "Factorisation", outcomes, difficulty: adaptivePractice.difficulty,
        attempts: questions.map((item, index) => ({ prompt: `Factorise completely: ${item.expression}`, learnerAnswer: answers[index] ?? "", expectedAnswer: item.correctAnswer, isCorrect: outcomes[index] ?? false })),
      });
      setSaving(false); setComplete(true); return;
    }
    setQuestionIndex((current) => current + 1); setSelected(null); setChecked(false);
  }

  function restartSession() { setQuestionIndex(0); setSelected(null); setChecked(false); setScore(0); setOutcomes([]); setAnswers([]); setComplete(false); setSaving(false); }

  if (complete) return (
    <SafeAreaView style={styles.safeArea}><View style={styles.completionScreen}>
      <Image source={{ uri: mascotUri }} style={styles.completionMascot} resizeMode="contain" />
      <Text style={styles.completionEyebrow}>PRACTICE COMPLETE</Text><Text style={styles.completionTitle}>Nice work. You finished the set.</Text>
      <Text style={styles.completionScore}>{score} / {questions.length} correct</Text>
      <View style={styles.adaptiveCard}><Text style={styles.adaptiveEyebrow}>NOMI ADAPTED</Text><Text style={styles.adaptiveBody}>{adaptivePractice.message}</Text></View>
      <Pressable style={[styles.button, styles.completionButton]} onPress={restartSession}><Text style={styles.buttonText}>Practice again</Text></Pressable>
    </View></SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}><View style={styles.screen}>
      <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.eyebrow}>MATHEMATICS · FACTORISATION</Text><Text style={styles.progressText}>Question {questionIndex + 1} of {questions.length} · Level {adaptivePractice.difficulty}</Text></View><Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" /></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: progress }]} /></View>
      <View style={styles.questionBlock}><Text style={styles.prompt}>Factorise completely:</Text><Text style={styles.expression}>{question.expression}</Text><Text style={styles.helper}>Choose the expression that takes out the greatest common factor.</Text></View>
      <View style={styles.answers}>{question.answers.map((answer) => { const active = selected === answer; const correct = checked && answer === question.correctAnswer; const wrong = checked && active && answer !== question.correctAnswer; return <Pressable key={answer} disabled={checked} onPress={() => setSelected(answer)} style={[styles.answer, active && styles.answerActive, correct && styles.answerCorrect, wrong && styles.answerWrong]}><Text style={[styles.answerText, active && styles.answerTextActive]}>{answer}</Text></Pressable>; })}</View>
      {checked ? <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackRetry]}><Text style={styles.feedbackEyebrow}>{isCorrect ? "NICE WORK" : "ALMOST"}</Text><Text style={styles.feedbackTitle}>{isCorrect ? "You found the greatest common factor." : "Look for the largest number shared by both terms."}</Text><Text style={styles.feedbackBody}>{isCorrect ? question.explanation : `The correct factorisation is ${question.correctAnswer}. ${question.explanation}`}</Text></View> : null}
      <Pressable disabled={!selected || saving} onPress={() => void handlePrimaryAction()} style={[styles.button, (!selected || saving) && styles.buttonDisabled]}><Text style={styles.buttonText}>{saving ? "Saving progress..." : checked ? (questionIndex === questions.length - 1 ? "Finish practice" : "Next question") : "Check answer"}</Text></Pressable>
    </View></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:colors.cream},screen:{flex:1,padding:spacing.lg},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},headerCopy:{flex:1,paddingRight:spacing.sm},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.1},progressText:{color:colors.slate,fontSize:13,marginTop:5},mascot:{height:72,width:72},progressTrack:{backgroundColor:colors.stone,borderRadius:radius.pill,height:7,marginTop:spacing.md,overflow:"hidden"},progressFill:{backgroundColor:colors.mint,borderRadius:radius.pill,height:7},questionBlock:{marginTop:spacing.xl},prompt:{color:colors.slate,fontSize:16,fontWeight:"600"},expression:{color:colors.ink,fontSize:46,fontWeight:"800",letterSpacing:-1.5,marginTop:spacing.sm},helper:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.sm},answers:{gap:10,marginTop:spacing.xl},answer:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.md,borderWidth:2,paddingHorizontal:spacing.lg,paddingVertical:17},answerActive:{borderColor:colors.primaryPurple,backgroundColor:colors.lavender},answerCorrect:{borderColor:colors.mint},answerWrong:{borderColor:colors.pink},answerText:{color:colors.ink,fontSize:18,fontWeight:"700"},answerTextActive:{color:colors.primaryPurple},feedback:{borderRadius:radius.md,marginTop:spacing.md,padding:spacing.md},feedbackCorrect:{backgroundColor:colors.lavender},feedbackRetry:{backgroundColor:colors.pink},feedbackEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},feedbackTitle:{color:colors.ink,fontSize:16,fontWeight:"800",lineHeight:21,marginTop:5},feedbackBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:4},button:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:"auto",paddingVertical:16},completionButton:{alignSelf:"stretch",marginTop:spacing.xl},buttonDisabled:{opacity:.35},buttonText:{color:colors.white,fontSize:16,fontWeight:"800"},completionScreen:{flex:1,alignItems:"center",justifyContent:"center",padding:spacing.xl},completionMascot:{height:140,width:140,marginBottom:spacing.lg},completionEyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},completionTitle:{color:colors.ink,fontSize:30,fontWeight:"800",lineHeight:35,marginTop:spacing.sm,textAlign:"center"},completionScore:{color:colors.primaryPurple,fontSize:22,fontWeight:"900",marginTop:spacing.lg},adaptiveCard:{alignSelf:"stretch",backgroundColor:colors.lavender,borderRadius:radius.md,marginTop:spacing.lg,padding:spacing.lg},adaptiveEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},adaptiveBody:{color:colors.ink,fontSize:14,fontWeight:"700",lineHeight:21,marginTop:6}
});
