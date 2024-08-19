'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckUsername } from '../data-access/crowdfunding-data-access';

export default function UsernameForm() {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<boolean>(false);

  const router = useRouter();
  const { data: usernameRecord } = useCheckUsername({ username: username });

  const validateUsername = (value: string) => {
    if (value === '') {
      return 'Username cannot be empty';
    }
    if (value.length < 3 || value.length > 20) {
      return 'Username must be between 3 and 20 characters';
    }
    if (usernameRecord) {
      return 'Username is already taken';
    }
    return null;
  };

  useEffect(() => {
    if (touched) {
      const error = validateUsername(username.trim());
      setError(error);
    }

  }, [username, usernameRecord]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (error) {
      // Prevent form submission if there's an error
      return;
    }

    router.push(`/register?username=${username}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setTouched(true); // Mark the field as touched on change
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 mb-2">
      <div className="relative mb-10 flex w-full items-center justify-between rounded-full bg-purple-200 px-6 py-3 md:mb-0">
        <div className="text-white-100">soltips.io/</div>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleChange}
          className="mx-1 w-[80px] bg-transparent focus:outline-none md:w-full"
          required
        />

        <button
          type="submit"
          className="btn btn-sm rounded-btn bg-purple-800 text-white outline-none transition duration-300 ease-in-out hover:scale-105 hover:bg-purple-800 hover:text-white hover:opacity-90"
          disabled={error !== null}
        >
          Claim
        </button>
      </div>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </form>
  );
};