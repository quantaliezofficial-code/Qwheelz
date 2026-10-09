import { useState, type FormEvent } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useEnquiry, useSendMessage, useCloseEnquiry } from "../hooks/useEnquiries";
import { useAuth } from "../lib/auth";
import { LoadingBlock, StatusBadge } from "./ui";

export function EnquiryThread({ enquiryId, onBack }: { enquiryId: string; onBack: () => void }) {
  const { user } = useAuth();
  const { data: enquiry, isLoading } = useEnquiry(enquiryId);
  const sendMessage = useSendMessage();
  const closeEnquiry = useCloseEnquiry();
  const [text, setText] = useState("");

  if (isLoading || !enquiry) return <LoadingBlock label="Loading conversation…" />;

  const otherParty = user?.id === enquiry.buyer.id ? enquiry.seller : enquiry.buyer;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage.mutateAsync({ id: enquiry.id, content: text });
    setText("");
  };

  return (
    <div className="qz-card flex h-[32rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-fog px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-lg p-1.5 text-slate hover:bg-paper" aria-label="Back"><ArrowLeft size={17} /></button>
          <div>
            <p className="text-sm font-semibold text-ink">{otherParty.name}</p>
            <p className="text-xs text-slate">{enquiry.listing_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={enquiry.status} />
          {enquiry.status !== "closed" && (
            <button onClick={() => closeEnquiry.mutate(enquiry.id)} className="text-xs font-semibold text-slate-500 hover:text-blue-600">Close</button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 qz-scroll">
        {enquiry.messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${isMine ? "bg-ignition-500 text-white" : "bg-paper text-ink"}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {enquiry.status !== "closed" ? (
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-fog p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="qz-input flex-1 px-3 py-2 text-sm" />
          <button type="submit" disabled={sendMessage.isPending || !text.trim()} className="qz-btn-primary flex h-10 w-10 items-center justify-center rounded-lg disabled:opacity-60" aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="border-t border-fog p-3 text-center text-xs text-slate">This conversation is closed.</div>
      )}
    </div>
  );
}
