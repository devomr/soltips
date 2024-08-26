import { UserAvatar } from '@/components/creator/user-avatar';
import { IconChevronRight } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Creator } from '@/components/data-access/crowdfunding-data-access';

export default function ThankYouModal({
  hide,
  show,
  creator,
  quantity,
  donationItem,
  thanksMessage,
}: {
  hide: () => void;
  show: boolean;
  creator: Creator;
  quantity: number;
  donationItem: string;
  thanksMessage: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const creatorProfileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/creator/${creator.username}`;

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box w-11/12 max-w-2xl">
        <form method="dialog" onSubmit={hide}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <UserAvatar name={creator.fullname} imageUrl={creator.imageUrl} />
          </div>
          <h3 className="mb-6 text-xl font-semibold lg:text-2xl">
            You bought {creator.fullname} {quantity} {donationItem} 🎉
          </h3>
          {thanksMessage && <p className="mb-6 text-center">{thanksMessage}</p>}

          <Link
            href={creatorProfileUrl}
            target="_blank"
            className="btn btn-sm flex items-center"
          >
            Go to {creator.fullname}&#39;s page <IconChevronRight size={24} />
          </Link>
        </div>
      </div>
    </dialog>
  );
}
