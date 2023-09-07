'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import folderIcon from './PDFIcon.png';

const Dropzone = ({ className }: { className: any }) => {
  const [files, setFiles] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles?.length) {
      setFiles((previousFiles) => [
        ...previousFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        ),
      ]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': [],
    },
    maxFiles: 1,
    onDrop,
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (name: any) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const removeAll = () => {
    setFiles([]);
  };

  async function action() {
    if (!files?.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    formData.append('folder', 'next');

    fetch('/api/upsert', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const r = await res.json();
        console.log(r);
      })
      .catch((err) => {
        alert(err);
      });
  }

  return (
    <form action={action}>
      <div
        {...getRootProps({
          className: className,
        })}
      >
        <input {...getInputProps({ name: 'file' })} />
        <div className='flex flex-col items-center justify-center gap-4'>
          <ArrowUpTrayIcon className='h-5 w-5 fill-current' />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag & drop files here, or click to select files</p>
          )}
        </div>
      </div>

      <section className='mt-10'>
        <div className='flex gap-4'>
          <h2 className='title text-3xl font-semibold'>Preview</h2>
          <button
            type='button'
            onClick={removeAll}
            className='mt-1 rounded-md border border-rose-400 px-3 text-[12px] font-bold uppercase tracking-wider text-stone-500 transition-colors hover:bg-rose-400 hover:text-white'
          >
            Remove all files
          </button>
          <button
            type='submit'
            className='ml-auto mt-1 rounded-md border border-purple-400 px-3 text-[12px] font-bold uppercase tracking-wider text-stone-500 transition-colors hover:bg-purple-400 hover:text-white'
          >
            Process
          </button>
        </div>

        <ul className='mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
          {files.map((file) => (
            <li key={file.name} className='relative h-32 rounded-md'>
              <Image
                src={folderIcon}
                priority={true}
                alt={file.name}
                width={100}
                height={100}
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
                className='h-full w-full rounded-md object-contain'
              />
              <button
                type='button'
                className='absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border border-rose-400 bg-rose-400 transition-colors hover:bg-white'
                onClick={() => removeFile(file.name)}
              >
                <XMarkIcon className='h-5 w-5 fill-white transition-colors hover:fill-rose-400' />
              </button>
              <p className='mt-2 text-[12px] font-medium text-stone-500'>
                {file.name}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </form>
  );
};

export default Dropzone;
