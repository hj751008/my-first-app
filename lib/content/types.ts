export type GeneratedProblem = {
  id: string;
  level: "easy" | "medium" | "hard";
  prompt: string;
  answer: string;
  firstHint: string;
  secondHint: string;
};

export type DiagnosticQuestion = {
  id: number;
  prompt: string;
  options: readonly string[];
  answer: string;
  explanation: string;
};

export type LearningUnitContent = {
  overview: {
    title: string;
    subtitle: string;
    description: string;
    checkpoints: readonly string[];
  };
  misconceptions: readonly string[];
  hintCards: readonly {
    title: string;
    text: string;
  }[];
  generatedProblems: readonly GeneratedProblem[];
  diagnosticQuiz: readonly DiagnosticQuestion[];
};
