import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <Head>
        <title>Alvenio</title>
        <meta name="description" content="Video-based loan assistance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        {!started ? (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-primary-800 mb-6">
              Welcome to <span className="text-secondary-600">Alvenio</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Your personal AI-powered bank manager guiding you through a seamless loan application process.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <FeatureCard
                icon="📹"
                title="Video Interaction"
                description="Apply for loans through interactive video conversations with our Alvenio."
              />
              <FeatureCard
                icon="📄"
                title="Document Processing"
                description="Easily upload and process your documents without lengthy paperwork."
              />
              <FeatureCard
                icon="✅"
                title="Instant Assessment"
                description="Get immediate feedback on your loan eligibility and application status."
              />
            </div>
            <button
              onClick={() => setStarted(true)}
              className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Start My Application
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-800 mb-6 text-center">
              Choose Your Application Path
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ApplicationCard
                title="New Application"
                description="Start a fresh loan application process with our Alvenio."
                buttonText="Start New Application"
                href="/application/new"
              />
              <ApplicationCard
                title="Continue Application"
                description="Resume your existing application where you left off."
                buttonText="Continue Application"
                href="/application/continue"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-primary-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Alvenio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-primary-700 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ApplicationCard({ title, description, buttonText, href }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-primary-700 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link href={href} className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors">
        {buttonText}
      </Link>
    </div>
  );
} 