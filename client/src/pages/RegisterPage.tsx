import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

type FormState = {
  email: string;
  name: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: '', name: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => navigate('/login?registered=true'),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } };
      const data = error?.response?.data;
      if (data?.errors) {
        const errs: FieldErrors = {};
        data.errors.forEach(({ field, message }) => {
          errs[field as keyof FormState] = message;
        });
        setFieldErrors(errs);
      } else {
        setServerError(data?.message ?? 'Something went wrong');
      }
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Start managing your projects today</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            error={fieldErrors.name}
            autoComplete="name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={fieldErrors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
