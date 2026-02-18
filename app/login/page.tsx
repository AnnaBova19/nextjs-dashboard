import AcmeLogo from '@/app/ui/shared/acme-logo';
import LoginForm from '@/app/ui/auth/login-form';
import GoogleSignIn from '@/app/ui/auth/google-sign-in';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

 
export const metadata: Metadata = {
  title: 'Login',
};
 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col gap-4 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <h1 className={`${lusitana.className} mb-5 text-2xl text-center`}>
          Sign in to continue
        </h1>
        <Suspense>
          <GoogleSignIn />
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div data-orientation="horizontal" role="none" className="shrink-0 bg-gray-200 h-[1px] w-full"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>
          <LoginForm />
        </Suspense>
        <div className='flex justify-between items-center text-sm text-gray-500'>
          Don't have an account yet?
          <Link href="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </main>
  );
}