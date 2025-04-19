import { v4 as uuidv4 } from 'uuid';

interface StoredQuestion {
  id: string;
  question: string;
  explanation: string;
  timestamp: string;
}

class QuestionStore {
  private static readonly STORAGE_KEY = 'asked_questions';

  static saveQuestion(question: string, explanation: string): void {
    const questions = this.getQuestions();
    questions.push({
      id: uuidv4(),
      question,
      explanation,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
  }

  static getQuestions(): StoredQuestion[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static generateQuizQuestions(): Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }> {
    const questions = this.getQuestions();
    return questions.slice(0, 5).map((q, index) => {
      // Generate incorrect options based on other explanations
      const otherExplanations = questions
        .filter(other => other.id !== q.id)
        .map(other => other.explanation)
        .slice(0, 3);

      while (otherExplanations.length < 3) {
        otherExplanations.push(`Incorrect explanation ${otherExplanations.length + 1}`);
      }

      const options = [q.explanation, ...otherExplanations];
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctAnswer = options.indexOf(q.explanation);

      return {
        id: index + 1,
        question: `What is the correct explanation for: ${q.question}?`,
        options,
        correctAnswer,
      };
    });
  }
}

export default QuestionStore;
