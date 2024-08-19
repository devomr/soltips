import { FeatureCard } from './feature-card';
import UsernameForm from './username-form';

const featureCards = [
  {
    id: 1,
    title: 'Get money directly into your wallet',
    content: (
      <p>
        You get donations instantly in your Solana wallet.{' '}
        <strong>Zero fees</strong>
      </p>
    ),
  },
  {
    id: 2,
    title: 'Get money directly into your wallet',
    content: (
      <p>
        You get donations instantly in your Solana wallet.{' '}
        <strong>Zero fees</strong>
      </p>
    ),
  },
  {
    id: 3,
    title: 'Get money directly into your wallet',
    content: (
      <p>
        You get donations instantly in your Solana wallet.{' '}
        <strong>Zero fees</strong>
      </p>
    ),
  },
];

export default async function LandingFeature() {
  return (
    <>
      <section className="py-16">
        <div className="mx-auto max-w-screen-2xl px-2 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[650px] flex-col items-center justify-center text-center">
            <h1 className="text-balance mb-4 text-center text-3xl font-bold text-slate-900 md:text-6xl md:leading-tight">
              Get support from your audience in crypto
            </h1>
            <p className="mb-14 text-xl text-slate-700">
              Accept donations, start a membership or create crowdfunding
              capaigns. <strong>All using Solana.</strong>
            </p>
            <UsernameForm />
            <p className="text-sm text-slate-600">
              It's free and takes just few seconds
            </p>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-screen-2xl px-2 sm:px-6 lg:px-8">
          <h2 className="text-balance mb-10 text-center text-4xl font-bold text-slate-900">
            Designed for Crypto creators
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ id, title, content }) => (
              <FeatureCard key={id} title={title} content={content} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
