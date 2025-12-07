import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
        
        <div className="prose prose-slate">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> December 2024
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using FiveMarket, you accept and agree to be bound by these Terms and Conditions.
              This is a student project created for educational purposes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
            <p className="text-gray-700">
              Users are responsible for maintaining the confidentiality of their account credentials.
              You agree to provide accurate information during registration.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Service Usage</h2>
            <p className="text-gray-700">
              FiveMarket provides a platform connecting clients with freelancers. Users agree to use the
              service in compliance with all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Educational Project Notice</h2>
            <p className="text-gray-700 font-semibold">
              This is a class project developed for CS353. The platform is for demonstration and
              educational purposes only.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact</h2>
            <p className="text-gray-700">
              For questions about these terms, please contact the development team.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
