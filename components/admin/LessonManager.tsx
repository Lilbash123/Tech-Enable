"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2, UploadCloud, FileText, Video, ListChecks, Plus } from "lucide-react";
import type { Lesson, QuizQuestion } from "@/lib/types/admin";
import {
  createLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
  setLessonQuizAction,
  uploadLessonVideoAction,
  uploadLessonPdfAction,
} from "@/app/admin/lessons/actions";

export default function LessonManager({ courseId, initialLessons }: { courseId: string; initialLessons: Lesson[] }) {
  const [lessons, setLessons] = useState<Lesson[]>(
    [...initialLessons].sort((a, b) => a.position - b.position)
  );
  const [isPending, startTransition] = useTransition();
  const [quizEditorLessonId, setQuizEditorLessonId] = useState<string | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const next = [...lessons];
    [next[index], next[target]] = [next[target], next[index]];
    setLessons(next);
    startTransition(() => {
      reorderLessonsAction(courseId, next.map((l) => l.id));
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lesson?")) return;
    setLessons((prev) => prev.filter((l) => l.id !== id));
    await deleteLessonAction(id, courseId);
  }

  return (
    <div className="grid gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {lessons.length === 0 && (
          <p className="p-6 text-sm text-slate-400 text-center">No lessons yet. Add the first one below.</p>
        )}
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || isPending}
                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0A66FF] disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === lessons.length - 1 || isPending}
                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0A66FF] disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="w-7 h-7 rounded-full bg-[#0A66FF]/10 text-[#0A66FF] text-xs font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate">{lesson.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                {lesson.video_url && (
                  <span className="inline-flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Video
                  </span>
                )}
                {lesson.pdf_url && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </span>
                )}
                {lesson.duration_minutes && <span>{lesson.duration_minutes} min</span>}
                {lesson.has_quiz && <span className="text-[#0A66FF] font-semibold">Quiz added</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setQuizEditorLessonId(quizEditorLessonId === lesson.id ? null : lesson.id)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0A66FF] hover:border-[#0A66FF] transition-colors"
              aria-label="Edit quiz"
            >
              <ListChecks className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(lesson.id)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
              aria-label="Delete lesson"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {quizEditorLessonId === lesson.id && (
              <QuizEditor
                lesson={lesson}
                courseId={courseId}
                onClose={() => setQuizEditorLessonId(null)}
                onSaved={(quiz) =>
                  setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, has_quiz: quiz.length > 0, quiz } : l)))
                }
              />
            )}
          </div>
        ))}
      </div>

      <AddLessonForm courseId={courseId} onCreated={(l) => setLessons((prev) => [...prev, l])} />
    </div>
  );
}

function AddLessonForm({ courseId, onCreated }: { courseId: string; onCreated: (l: Lesson) => void }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadLessonVideoAction(fd);
    setUploadingVideo(false);
    if (result.url) setVideoUrl(result.url);
  }

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadLessonPdfAction(fd);
    setUploadingPdf(false);
    if (result.url) setPdfUrl(result.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("course_id", courseId);
    fd.append("title", title);
    fd.append("duration_minutes", duration);
    fd.append("video_url", videoUrl);
    fd.append("pdf_url", pdfUrl);
    const result = await createLessonAction(fd);
    setSubmitting(false);
    if (!result.error) {
      onCreated({
        id: crypto.randomUUID(),
        course_id: courseId,
        title,
        position: 9999,
        video_url: videoUrl || null,
        pdf_url: pdfUrl || null,
        has_quiz: false,
        quiz: null,
        duration_minutes: duration ? Number(duration) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setTitle("");
      setDuration("");
      setVideoUrl("");
      setPdfUrl("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-4">
      <p className="text-sm font-semibold text-[#111827]">Add a lesson</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          required
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
        />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          type="number"
          min={0}
          placeholder="Duration (minutes)"
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploadingVideo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-[#0A66FF] hover:text-[#0A66FF] disabled:opacity-60"
        >
          <UploadCloud className="w-4 h-4" />
          {uploadingVideo ? "Uploading video..." : videoUrl ? "Video uploaded ✓" : "Upload video"}
        </button>

        <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={uploadingPdf}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-[#0A66FF] hover:text-[#0A66FF] disabled:opacity-60"
        >
          <UploadCloud className="w-4 h-4" />
          {uploadingPdf ? "Uploading PDF..." : pdfUrl ? "PDF uploaded ✓" : "Upload PDF"}
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          {submitting ? "Adding..." : "Add lesson"}
        </button>
      </div>
    </form>
  );
}

function QuizEditor({
  lesson,
  courseId,
  onClose,
  onSaved,
}: {
  lesson: Lesson;
  courseId: string;
  onClose: () => void;
  onSaved: (quiz: QuizQuestion[]) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(lesson.quiz ?? []);
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, { question: "", options: ["", "", "", ""], correct_index: 0 }]);
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q))
    );
  }

  async function handleSave() {
    setSaving(true);
    await setLessonQuizAction(lesson.id, courseId, questions);
    setSaving(false);
    onSaved(questions);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 grid gap-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#111827]">Quiz — {lesson.title}</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            Close
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border border-slate-200 rounded-xl p-4 grid gap-3">
            <input
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
              placeholder={`Question ${qIndex + 1}`}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
            {q.options.map((opt, oIndex) => (
              <label key={oIndex} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correct_index === oIndex}
                  onChange={() => updateQuestion(qIndex, { correct_index: oIndex })}
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                />
              </label>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-[#0A66FF] hover:text-[#0A66FF]"
        >
          <Plus className="w-4 h-4" /> Add question
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save quiz"}
        </button>
      </div>
    </div>
  );
}
