import { useEffect, useRef } from 'react';
import { Creator } from '@/components/data-access/crowdfunding-data-access';
import { UserAvatar } from '../user-avatar';

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
            <span className="mr-1">🎉</span>
            You bought {creator.fullname} {quantity} {donationItem}
            <span className="ml-1">🎉</span>
          </h3>
          {thanksMessage && <p className="text-center">{thanksMessage}</p>}
        </div>
      </div>
    </dialog>
  );
}
