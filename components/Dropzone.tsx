'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import folderIcon from "../public/images/PDFIcon.png";
import {ThreeDots} from 'react-loader-spinner';
import Swal from 'sweetalert2'

const Dropzone = ({ className }: { className: any }) => {
  const[loading,setLoading]= useState(false);

  const [files, setFiles] = useState<any[]>([]);

  const popUpSuccess = () => {
    Swal.fire('Success!', 'PDF(s) has been processed.', 'success');
  }
  const popUpError = (errorMessage : string) => {
    Swal.fire('Error!', `${errorMessage}, Failed to process PDF(s).`, 'error');
  }

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles?.length) {
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      ])
    }

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': [],
    },
    maxFiles: 5,
    onDrop,
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (name: any) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const loadIt = () => {
    setLoading(true);
  }

  const removeAll = () => {
    setFiles([]);
  };

  async function action() {
    if (!files?.length) return;
    if(loading) return;

    
    const formData = new FormData();
    files.forEach(file => formData.append('file', file))
    formData.append('folder', 'next');

    const res = await fetch('/api/upsert',{
      method: 'POST',
      body: formData,
    })
    console.log(res);
    console.log(res.status);
    if(res.status === 200)
    {
      const r = await res.json();
      console.log(r);
      setLoading(false);
      popUpSuccess()
      removeAll();
    }
    else if(res.status === 400)
    {
      setLoading(false);
      const {message} = await res.json();
      popUpError(message);
    }
    else {
      setLoading(false);
    }

  }

  return (
    <form action={() => {
      loadIt();
      action();
    }}>
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
            className='ml-auto mt-1 rounded-md border border-blue-700 px-3 text-[12px] font-bold uppercase tracking-wider text-stone-500 transition-colors hover:bg-blue-400 hover:text-white'
          >
           
          {!loading && "Process"}
        <div >
          {loading && 
        <ThreeDots
        width="60"
        height="20"
        color="blue"
        ariaLabel="loading"
        wrapperClass='justify-center'
        />
        }
      </div>
          </button>
        </div>

        <ul className='mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
          {files.map((file) => (
            <li key={file.name} className='relative h-32 rounded-md shadow-lg'>
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
