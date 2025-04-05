import { useEffect, useState } from "preact/hooks";
import { marked } from "marked";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Preview() {
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const handleNoteUpdate = () => {
      const notes = JSON.parse(localStorage.getItem("notes") || "[]");
      const selectedNoteId = localStorage.getItem("selectedNoteId");
      setNote(notes.find((n: Note) => n.id === selectedNoteId) || null);
    };
    
    handleNoteUpdate();
    window.addEventListener("storage", handleNoteUpdate);
    return () => window.removeEventListener("storage", handleNoteUpdate);
  }, []);

  const updateNote = (field: "title" | "content", value: string) => {
    if (!note) return;

    setNote(prevNote => {
      if (!prevNote) return null;
      const updatedNote = { 
        ...prevNote, 
        [field]: value,
        updatedAt: new Date().toISOString()
      };

      const updatedNotes = JSON.parse(localStorage.getItem("notes") || "[]").map((n: Note) => n.id === prevNote.id ? updatedNote : n);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      window.dispatchEvent(new StorageEvent('storage', { key: 'notes' }));  
      return updatedNote;
    });
  };

  if (!note) return <div class="p-4 text-gray-500">Select a note to begin</div>;

  return (
    <div class="p-4 space-y-4 h-full flex flex-col">
      <input
        type="text"
        value={note.title}
        onChange={(e) => updateNote("title", e.currentTarget.value)}
        class="text-2xl font-bold w-full p-2 border-b border-gray-300 focus:outline-none"
      />

      <div class="flex justify-end mb-2">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          class="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
        >
          {isEditing ? "Preview" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={note.content}
          onChange={(e) => updateNote("content", e.currentTarget.value)}
          class="w-full p-2 focus:outline-none flex-grow resize-none font-mono"
          placeholder="Markdown Editor..."
        />
      ) : (
        <div 
          class="w-full p-2 flex-grow overflow-auto prose"
          dangerouslySetInnerHTML={{ __html: marked(note.content) }}
        />
      )}
    </div>
  );
}