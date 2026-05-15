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
  name: string;
  title: string;
  company: string;
  mood: string;
  avatar_emoji: string;
  pains: string[];
  intro_line: string;
  accent_color: "navy" | "coral" | "sunny" | "gleam";
};

export type StartResponse = {
  persona: Persona;
  questions: Question[];
};

export type FinishResponse = {
  verdict: "FECHOU" | "QUASE" | "PERDEU";
  headline: string;
  tip: string;
};

export type AnswerKey = "A" | "B" | "C";
