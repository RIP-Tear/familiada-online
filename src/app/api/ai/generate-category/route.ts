import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "łatwy",
  medium: "średni",
  hard: "trudny",
};

export async function POST(request: NextRequest) {
  const { category, difficulty } = await request.json();

  if (!category || typeof category !== "string" || !category.trim()) {
    return NextResponse.json({ error: "Brak nazwy kategorii" }, { status: 400 });
  }

  const difficultyLabel = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.medium;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "AI nie jest skonfigurowane" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Jesteś generatorem pytań do polskiej gry 'Familiada' (odpowiednik Family Feud). " +
            "Dla podanej kategorii i poziomu trudności wygeneruj dokładnie 5 pytań ankietowych " +
            "(w stylu 'Wymień...', 'Podaj...', 'Co...'), a dla każdego pytania od 3 do 10 najbardziej " +
            "prawdopodobnych/popularnych odpowiedzi, posortowanych od najbardziej do najmniej popularnej " +
            "(pierwsza odpowiedź = najpopularniejsza). Odpowiedzi mają być krótkie (kilka słów), po polsku, " +
            "bez duplikatów w obrębie jednego pytania. " +
            "WAŻNE: liczba odpowiedzi ma się różnić między pytaniami, zależnie od tego, ile sensownych, " +
            "popularnych odpowiedzi realnie istnieje dla danego pytania - nie generuj sztucznie tej samej " +
            "liczby (np. 6) dla każdego pytania. Jeśli pytanie ma naturalnie tylko 3-4 oczywiste odpowiedzi, " +
            "podaj tylko tyle - nie dodawaj naciąganych, mało trafnych pozycji tylko żeby dobić do 10. " +
            "Jeśli temat jest bogaty i pytanie faktycznie ma wiele dobrych odpowiedzi, podaj ich więcej (do 10). " +
            "W obrębie jednej kategorii różne pytania powinny mieć wyraźnie różną liczbę odpowiedzi (np. jedno 3, " +
            "inne 5, inne 8) - unikaj sytuacji, w której wszystkie pytania mają tyle samo odpowiedzi. " +
            "Zwróć wyłącznie JSON w formacie: " +
            '{"questions":[{"question":"...","answers":["...","..."]}]} bez dodatkowego tekstu.',
        },
        {
          role: "user",
          content: `Kategoria: "${category.trim()}". Poziom trudności: ${difficultyLabel}.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Pusta odpowiedź AI");
    }

    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const cleaned = questions.slice(0, 5).map((q: { question?: string; answers?: string[] }) => ({
      question: (q.question || "").trim(),
      answers: (Array.isArray(q.answers) ? q.answers : [])
        .map((a) => (a || "").trim())
        .filter((a) => a.length > 0)
        .slice(0, 10),
    }));

    if (cleaned.length !== 5 || cleaned.some((q: { question: string; answers: string[] }) => !q.question || q.answers.length < 3)) {
      return NextResponse.json({ error: "AI zwróciło niekompletne dane, spróbuj ponownie" }, { status: 502 });
    }

    return NextResponse.json({ questions: cleaned });
  } catch (error) {
    console.error("[AI generate-category]", error);
    return NextResponse.json({ error: "Błąd podczas generowania pytań przez AI" }, { status: 500 });
  }
}
