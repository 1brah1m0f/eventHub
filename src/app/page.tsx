import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Manage any event,<br />
        <span className="text-indigo-600">all in one place.</span>
      </h1>
      <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
        Hackathons, conferences, bootcamps, meetups — create, manage, and grow your community events with EventHub.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/events"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">
          Browse Events
        </Link>
        <Link href="/register"
          className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
