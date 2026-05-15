export type Option = {
  text: string;
  points: number;
  reaction: string;
};

export type Question = {
  text: string;
  options: {
    A: Option;
    B: Option;
    C: Option;
  };
};

export type Persona = {
  archetype: string;
  name: string;
  title: string;
  company: string;
  mood: string;
  pains: string[];
  intro_line: string;
};

export type StartResponse = {
  persona: Persona;
  questions: Question[];
};

export type FinishResponse = {
  verdict: "CLOSED" | "ALMOST" | "LOST";
  headline: string;
  tip: string;
};

export type AnswerKey = "A" | "B" | "C";
