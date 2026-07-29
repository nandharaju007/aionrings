import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const valid =
    form.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.message.trim().length > 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-message', { body: form });
      if (error) throw error;
      toast.success("Message sent — we'll reply to you shortly.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('contact form failed:', err);
      toast.error('Could not send your message. Please email support@aionrings.com directly.');
    } finally {
      setSending(false);
    }
  };

  const field =
    'w-full bg-background/40 border border-border/60 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="card-glass p-6 md:p-8 space-y-4 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          className={field}
          placeholder="Full name"
          value={form.name}
          maxLength={100}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className={field}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          maxLength={255}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <input
        className={field}
        placeholder="Subject (optional)"
        value={form.subject}
        maxLength={150}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      />
      <textarea
        className={`${field} min-h-[140px] resize-y`}
        placeholder="How can we help with your privacy or data request?"
        value={form.message}
        maxLength={4000}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />
      <button
        type="submit"
        disabled={!valid || sending}
        className={`btn-primary w-full md:w-auto ${!valid || sending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {sending ? 'Sending…' : 'Send message'}
      </button>
      <p className="text-caption">Messages are sent to support@aionrings.com. We typically reply within 2 business days.</p>
    </form>
  );
};
