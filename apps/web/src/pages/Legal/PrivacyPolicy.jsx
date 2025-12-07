import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> December 2024
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-700">
              We collect information you provide during registration, including your name, email address,
              and account preferences. This is a student project for educational purposes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700">
              Your information is used to provide and improve our services, communicate with you,
              and ensure platform security.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information.
              Passwords are encrypted and stored securely.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Educational Project Notice</h2>
            <p className="text-gray-700 font-semibold">
              This is a class project developed for CS353. Data handling practices are implemented
              for demonstration and learning purposes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p className="text-gray-700">
              You have the right to access, update, or delete your personal information at any time
              through your account settings.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact the development team.
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
