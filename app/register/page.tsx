import AcmeLogo from '@/app/ui/acme-logo';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import RegisterForm from '@/app/ui/register-form';

export const metadata: Metadata = {
  title: 'Register',
};
 
export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col gap-4 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <h1 className={`${lusitana.className} mb-5 text-2xl text-center`}>
          Create your account to begin
        </h1>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <div className='flex justify-between items-center text-sm text-gray-500'>
          Already have an account?
          <Link href="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}