import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string;
  options: string[];
  is_required: boolean;
  sort_order: number;
}

interface RegistrationForm {
  id: string;
  name: string;
  description: string;
  success_message: string;
}

interface RegistrationFormModalProps {
  formId: string;
  programId?: string;
  courseId?: string;
  onClose: () => void;
}

export default function RegistrationFormModal({
  formId,
  programId,
  courseId,
  onClose,
}: RegistrationFormModalProps) {
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    const [formData, fieldsData] = await Promise.all([
      supabase.from('registration_forms').select('*').eq('id', formId).maybeSingle(),
      supabase.from('form_fields').select('*').eq('form_id', formId).order('sort_order'),
    ]);

    if (formData.data) setForm(formData.data);
    if (fieldsData.data) setFields(fieldsData.data);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.is_required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }

      if (field.field_type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }

      if (field.field_type === 'phone' && formData[field.id]) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const responses: Record<string, any> = {};
    fields.forEach((field) => {
      responses[field.label] = formData[field.id] || '';
    });

    const { error } = await supabase.from('form_submissions').insert({
      form_id: formId,
      program_id: programId || null,
      course_id: courseId || null,
      responses,
    });

    setIsSubmitting(false);

    if (!error) {
      setIsSuccess(true);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' });
    }
  };

  const renderField = (field: FormField) => {
    const commonClasses = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';
    const errorClasses = errors[field.id] ? 'border-red-500' : 'border-gray-300';

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${commonClasses} ${errorClasses}`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          >
            <option value="">Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = formData[field.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    handleFieldChange(field.id, updated);
                  }}
                  className="rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  checked={formData[field.id] === option}
                  onChange={() => handleFieldChange(field.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.field_type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${commonClasses} ${errorClasses}`}
          />
        );
    }
  };

  if (isSuccess && form) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Success!</h3>
          <p className="text-gray-700 mb-6">{form.success_message}</p>
          <button
            onClick={onClose}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{form.name}</h2>
            {form.description && (
              <p className="text-gray-600 mt-1">{form.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
