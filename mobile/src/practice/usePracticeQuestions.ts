import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type PracticeQuestion = {
  id: string; topicId: string; conceptName: string; difficulty: number;
  questionType: "multiple_choice" | "short_answer"; prompt: string;
  options: { id: string; label: string }[]; expectedAnswer: { option_id?: string; accepted?: string[] };
  explanation: string; misconceptionKey: string | null; misconceptionCategory: string | null;
};
type Row = {
  id:string; topic_id:string; concept_name:string; difficulty:number; question_type:"multiple_choice"|"short_answer"; prompt:string;
  options:{id:string;label:string}[]|null; expected_answer:{option_id?:string;accepted?:string[]}; explanation:string;
  misconception_key:string|null; misconception_category:string|null;
};
const questionCache = new Map<string, PracticeQuestion[]>();
const pendingQuestions = new Map<string, Promise<PracticeQuestion[]>>();

async function fetchQuestions(topicId: string) {
  const cached = questionCache.get(topicId);
  if (cached) return cached;
  const pending = pendingQuestions.get(topicId);
  if (pending) return pending;
  if (!supabase) return [];
  const request = Promise.resolve(supabase.from("practice_questions").select("id,topic_id,concept_name,difficulty,question_type,prompt,options,expected_answer,explanation,misconception_key,misconception_category").eq("topic_id",topicId).eq("active",true).order("sort_order")).then(({data,error}) => {
    if (error) throw error;
    const questions = ((data ?? []) as Row[]).map(row=>({id:row.id,topicId:row.topic_id,conceptName:row.concept_name,difficulty:row.difficulty,questionType:row.question_type,prompt:row.prompt,options:row.options??[],expectedAnswer:row.expected_answer,explanation:row.explanation,misconceptionKey:row.misconception_key,misconceptionCategory:row.misconception_category}));
    questionCache.set(topicId, questions);
    pendingQuestions.delete(topicId);
    return questions;
  }).catch((error) => { pendingQuestions.delete(topicId); throw error; });
  pendingQuestions.set(topicId, request);
  return request;
}

export function usePracticeQuestions(topicId: string | null, targetDifficulty: number) {
  const [allQuestions,setAllQuestions]=useState<PracticeQuestion[]>(topicId ? questionCache.get(topicId) ?? [] : []);
  const [loading,setLoading]=useState(Boolean(topicId && !questionCache.has(topicId)));
  const [error,setError]=useState<string|null>(null);
  const requestId = useRef(0);
  const load=useCallback(async()=>{
    const currentRequest = ++requestId.current;
    if(!topicId){setAllQuestions([]);setLoading(false);return;}
    const cached = questionCache.get(topicId);
    if (cached) { setAllQuestions(cached); setLoading(false); return; }
    setLoading(true);setError(null);
    try {
      const data = await fetchQuestions(topicId);
      if (currentRequest === requestId.current) setAllQuestions(data);
    } catch (queryError) {
      if (currentRequest === requestId.current) { setError(queryError instanceof Error ? queryError.message : "Questions could not be loaded."); setAllQuestions([]); }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  },[topicId]);
  useEffect(()=>{void load();},[load]);
  const questions=useMemo(()=>[...allQuestions].sort((a,b)=>Math.abs(a.difficulty-targetDifficulty)-Math.abs(b.difficulty-targetDifficulty)).slice(0,5),[allQuestions,targetDifficulty]);
  return {questions,loading,error,reload:load};
}
export function isAcceptedAnswer(question: PracticeQuestion, value:string){
  const normalized=value.replace(/\s+/g,"").toLowerCase();
  const accepted=question.expectedAnswer.accepted??[];
  if(accepted.some(answer=>answer.replace(/\s+/g,"").toLowerCase()===normalized)) return true;
  const option=question.options.find(item=>item.id===question.expectedAnswer.option_id);
  return option ? option.label.replace(/\s+/g,"").toLowerCase()===normalized : false;
}
