'use client';
import Dropzone from '@/components/Dropzone';
import Link from 'next/link';
import { ChevronLeft } from 'react-feather';

export default function Upsert() {
  return (
    <div className=' mx-40'>
      <div className='container mx-auto'>
        <div className=' pb-24 pt-8 '>
          <Link href='/'>
            <ChevronLeft />
          </Link>
        </div>
        <h1 className='text-3xl font-bold'>Upload Files</h1>
        <Dropzone className='mt-10 border border-neutral-200 p-24' />
      </div>
    </div>
  );
}
