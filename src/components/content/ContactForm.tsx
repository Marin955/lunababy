'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { sendContactMessage } from '@/services/api/contact';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ContactForm() {
  const t = useTranslations('contactPage');
  const locale = useLocale();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.error');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('form.error');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.emailInvalid');
    }
    if (!formData.subject.trim()) {
      newErrors.subject = t('form.error');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('form.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || sending) return;

    setSending(true);
    setSendFailed(false);
    try {
      await sendContactMessage({ ...formData, language: locale, website: honeypot });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSendFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-teal-pale/50 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-teal-deep/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-teal-deep" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-heading text-lg font-semibold text-text-dark mb-2">
          {t('form.success')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5" noValidate>
      <h2 className="font-heading text-2xl font-semibold text-text-dark mb-2">
        {t('form.title')}
      </h2>

      <Input
        label={t('form.name')}
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder={t('form.namePlaceholder')}
        error={errors.name}
      />

      <Input
        label={t('form.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t('form.emailPlaceholder')}
        error={errors.email}
      />

      <Input
        label={t('form.subject')}
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder={t('form.subjectPlaceholder')}
        error={errors.subject}
      />

      <Input
        label={t('form.message')}
        name="message"
        type="textarea"
        value={formData.message}
        onChange={handleChange}
        placeholder={t('form.messagePlaceholder')}
        error={errors.message}
      />

      {/* Honeypot: hidden from people and screen readers, tempting to bots */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {sendFailed && (
        <p role="alert" className="text-sm text-red-600">
          {t('form.sendError')}
        </p>
      )}

      <Button type="submit" disabled={sending}>
        {sending ? t('form.sending') : t('form.submit')}
      </Button>
    </form>
  );
}
