import { IconShare3, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

export function ShareCampaignButton({ link }: { link: string }) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCampaignLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
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
        className="btn btn-ghost btn-circle btn-sm"
      >
        <IconShare3 size={20} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow"
      >
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleCopyCampaignLink();
            }}
          >
            <IconCopy size={24} /> {linkCopied ? 'Copied' : 'Copy link'}
          </a>
        </li>
      </ul>
    </div>
  );
}
