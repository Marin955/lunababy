'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.error');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('form.error');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.error');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Demo: just show success
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

      <Button type="submit">
        {t('form.submit')}
      </Button>
    </form>
  );
}
