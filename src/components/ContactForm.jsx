
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { contactDetails } from '../data/socialLinks';

const initialFormData = {
  name: '',
  email: '',
  message: '',
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  // Validate individual fields
  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    switch (name) {
      case 'name':
        if (!trimmedValue) return 'Please enter your name.';
        if (trimmedValue.length < 2) return 'Name must contain at least 2 characters.';
        if (trimmedValue.length > 60) return 'Name cannot exceed 60 characters.';
        if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(trimmedValue)) {
          return 'Please enter a valid name.';
        }
        return '';

      case 'email':
        if (!trimmedValue) return 'Please enter your email address.';
        if (trimmedValue.length > 254) return 'Email address is too long.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedValue)) {
          return 'Please enter a valid email address.';
        }
        return '';

      case 'message':
        if (!trimmedValue) return 'Please enter a message.';
        if (trimmedValue.length < 20) return 'Message must contain at least 20 characters.';
        if (trimmedValue.length > 3000) return 'Message cannot exceed 3000 characters.';
        return '';

      default:
        return '';
    }
  };

  // Validate the complete form
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate after the field has already been touched
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    if (status === 'error') {
      setStatus('idle');
      setFeedback('');
    }
  };

  // Validate when leaving a field
  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === 'loading') return;

    if (!validateForm()) {
      setStatus('idle');
      setFeedback('');
      return;
    }

    setStatus('loading');
    setFeedback('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus('error');
      setFeedback('The contact service is not configured. Please try again later.');
      return;
    }

    const templateParams = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      reply_to: formData.email.trim(),
      message: formData.message.trim(),
      to_email: contactDetails.email,
    };

    try {
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        { publicKey }
      );

      setFormData(initialFormData);
      setErrors({});
      setStatus('success');
      setFeedback(
        'Thank you for reaching out! Your message has been received successfully. I’ll review your inquiry and get back to you at your email address shortly.'
      );
    } catch (error) {
      console.error('EmailJS Error:', error);

      setStatus('error');
      setFeedback(
        'Sorry, your message could not be sent. Please try again in a moment or contact me directly by email.'
      );
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 bg-[#171820] border rounded-xl font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all shadow-inner ${errors[field]
      ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
      : 'border-white/20 focus:border-amber-500 focus:ring-amber-500'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-4">

      {/* Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div>
          <label
            htmlFor="name"
            className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider"
          >
            YOUR NAME *
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="name"
            maxLength={60}
            placeholder="Enter Your Full Name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={inputClass('name')}
          />

          {errors.name && (
            <p id="name-error" className="mt-2 text-red-400 text-[11px] font-mono" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider"
          >
            EMAIL ADDRESS *
          </label>

          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            maxLength={254}
            placeholder="example@gmail.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass('email')}
          />

          {errors.email && (
            <p id="email-error" className="mt-2 text-red-400 text-[11px] font-mono" role="alert">
              {errors.email}
            </p>
          )}
        </div>

      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block font-mono text-xs font-bold text-zinc-200 uppercase mb-2 tracking-wider"
        >
          MESSAGE & PROJECT SCOPE *
        </label>

        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={3000}
          placeholder="Tell me about your project, requirements, timeline, and goals..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : 'message-count'}
          className={`${inputClass('message')} resize-y`}
        />

        <div className="flex justify-between items-center mt-2">
          {errors.message ? (
            <p id="message-error" className="text-red-400 text-[11px] font-mono" role="alert">
              {errors.message}
            </p>
          ) : (
            <p className="text-zinc-500 text-[10px] font-mono">
              Minimum 20 characters
            </p>
          )}

          <span id="message-count" className="text-zinc-500 text-[10px] font-mono">
            {formData.message.length}/3000
          </span>
        </div>
      </div>

      {/* Success / Error Feedback */}
      {status === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="p-5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <span className="text-emerald-400 text-lg">✓</span>
            <div>
              <p className="text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                Message Received Successfully
              </p>
              <p className="text-emerald-100/80 font-mono text-xs leading-relaxed">
                {feedback}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div
          role="alert"
          className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 font-mono text-xs"
        >
          {feedback}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-lg tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              SENDING MESSAGE...
            </span>
          ) : (
            'SEND MESSAGE'
          )}
        </button>
      </div>

    </form>
  );
}
