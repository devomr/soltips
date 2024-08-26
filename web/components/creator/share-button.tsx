import { IconCopy, IconShare3 } from '@tabler/icons-react';
import { useState } from 'react';

type ShareButtonProps = {
  username: string;
};

export function ShareButton({ username }: ShareButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyProfileLink = async () => {
    try {
      const profileLink = `${process.env.NEXT_PUBLIC_APP_URL}/creator/${username}`;
      await navigator.clipboard.writeText(profileLink);
      setLinkCopied(true);

      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn m-1 rounded-full text-base"
      >
        <IconShare3 size={24} /> Share
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        <li>
          <a
            href="#!"
            onClick={(e) => {
              e.preventDefault();
              handleCopyProfileLink();
            }}
          >
            <IconCopy size={24} /> {linkCopied ? 'Copied' : 'Copy profile link'}
          </a>
        </li>
      </ul>
    </div>
  );
}
