export default function LoadingSpinner({ fullScreen = false, message = "Loading..." }) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"></div>
        {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}
      </div>
    </div>
  );
}
