'use client';

import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import { AccountChecker } from '../account/account-ui';
import { ClusterChecker, ExplorerLink } from '../cluster/cluster-ui';
import toast, { Toaster } from 'react-hot-toast';
import { Navbar } from '../shared/navigation/navbar';

type ModalButtonStyle = {
  creatorTheme: boolean;
  block: boolean;
};

export function UiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-gray-100">
      <Navbar />
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="my-32 text-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </main>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
  submitStyle,
  closeVisible,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  submitStyle?: ModalButtonStyle;
  closeVisible?: boolean;
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hide(); // Call the hide function when the Escape key is pressed
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hide]); // Add hide to the dependency array

  const submitButtonClass = submitStyle?.creatorTheme
    ? 'bg-creator-primary text-creator-100 hover:bg-creator-primary hover:bg-opacity-90'
    : 'bg-purple-800 text-white hover:bg-purple-800 hover:bg-opacity-90';

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box">
        <form method="dialog" onSubmit={hide}>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 outline-none">
            ✕
          </button>
        </form>

        <div>
          <h3 className="mb-4 text-lg font-bold">{title}</h3>
          {children}
        </div>

        <div className="modal-action">
          {submit ? (
            <button
              className={`btn btn-md rounded-full ${submitStyle?.block ? 'flex-1' : ''} ${submitButtonClass}`}
              onClick={submit}
              disabled={submitDisabled}
            >
              {submitLabel || 'Save'}
            </button>
          ) : null}
          {closeVisible ? (
            <button
              onClick={hide}
              className="btn btn-md rounded-full"
              type="button"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={hide}>
        <button>close</button>
      </form>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === 'string' ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={'View Transaction'}
          className="btn btn-xs btn-primary"
        />
      </div>,
    );
  };
}
