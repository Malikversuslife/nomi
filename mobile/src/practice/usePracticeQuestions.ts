import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

export type PracticeQuestion = {
  id: string;
  topicId: string;
  conceptName: string;
  difficulty: number;
  questionType: "multiple_choice" | "short_answer";
  prompt: string;
  options: { id: string; label: string }[];
  expectedAnswer: { option_id?: string; accepted?: string[] };
  explanation: string;
  misconceptionKey: string | null;
  misconceptionCategory: string | null;
};

type Row = {
  id:string; topic_id:string; concept_name:string; difficulty:number; question_type:"multiple_choice"|"short_answer"; prompt:string;
  options:{id:string;label:string}[]|null; expected_answer:{option_id?:string;accepted?:string[]}; explanation:string;
  misconception_key:string|null; misconception_category:string|null;
};

export function usePracticeQuestions(topicId: string | null, targetDifficulty: number) {
  const [allQuestions,setAllQuestions]=useState<PracticeQuestion[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    if(!topicId){setAllQuestions([]);return;}
    setLoading(true);setError(null);
    const {data,error:queryError}=await supabase.from("practice_questions").select("id,topic_id,concept_name,difficulty,question_type,prompt,options,expected_answer,explanation,misconception_key,misconception_category").eq("topic_id",topicId).eq("active",true).order("sort_order");
    if(queryError){setError(queryError.message);setAllQuestions([]);setLoading(false);return;}
    setAllQuestions(((data??[]) as Row[]).map(row=>({id:row.id,topicId:row.topic_id,conceptName:row.concept_name,difficulty:row.difficulty,questionType:row.question_type,prompt:row.prompt,options:row.options??[],expectedAnswer:row.expected_answer,explanation:row.explanation,misconceptionKey:row.misconception_key,misconceptionCategory:row.misconception_category})));
    setLoading(false);
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
