import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { contactDetails } from '../data/socialLinks';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setFeedback('Please fill out all fields.');
      return;
    }

    setStatus('loading');
    setFeedback('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nkmclvs';
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ynjwyk8';
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'q6ud99RTUp03j81hB';

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS keys missing in .env file!');
      setStatus('error');
      setFeedback('EmailJS keys missing in your .env file.');
      return;
    }

    // Sender ki Email aur Name ko message me format kar diya hai
    // taake EmailJS template chahe jaisa bhi ho, sender ka email inbox me 100% dikhe!
    const formattedMessage = `SENDER DETAILS:
• Name: ${formData.name}
• Email: ${formData.email}

MESSAGE:
${formData.message}`;

    const templateParams = {
      name: formData.name,
      from_name: formData.name,
      user_name: formData.name,
      email: formData.email,
      from_email: formData.email,
      user_email: formData.email,
      reply_to: formData.email, // Gmail me 'Reply' dabane par direct sender ko email jayegi
      to_email: contactDetails.email,
      message: formattedMessage,
    };

    try {
      const res = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        {
          publicKey: publicKey,
        }
      );

      if (res.status === 200 || res.text === 'OK') {
        setStatus('success');
        setFeedback('Message delivered directly to your Gmail inbox! Thank you.');
        setFormData({ name: '', email: '', message: '' });

        // 4 seconds baad notification khud gayab aur form fresh
        setTimeout(() => {
          setStatus('idle');
          setFeedback('');
        }, 4000);
      } else {
        throw new Error(res.text || 'EmailJS failed');
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      setStatus('error');
      setFeedback(err?.text || err?.message || 'Failed to transmit message.');
      
      setTimeout(() => {
        setStatus('idle');
        setFeedback('');
      }, 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider">
            YOUR NAME *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter Your Full Name"
            className="w-full px-4 py-3.5 bg-[#171820] border border-white/20 rounded-xl font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider">
            EMAIL ADDRESS *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
            className="w-full px-4 py-3.5 bg-[#171820] border border-white/20 rounded-xl font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider">
          MESSAGE &amp; PROJECT SCOPE *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Details on requirements, timelines, and technical scope..."
          className="w-full px-4 py-3.5 bg-[#171820] border border-white/20 rounded-xl font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
        ></textarea>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 font-mono text-xs font-semibold">
          {feedback}
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 font-mono text-xs font-semibold">
          {feedback}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-lg tracking-wider uppercase disabled:opacity-50"
        >
          {status === 'loading' ? 'TRANSMITTING MESSAGE...' : 'SEND MESSAGE DIRECTLY ↗'}
        </button>
      </div>
    </form>
  );
}