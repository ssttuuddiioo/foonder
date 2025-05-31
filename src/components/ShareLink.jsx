import { useState } from 'react';
import { X, Copy, Share, Check } from 'lucide-react';

const ShareLink = ({ sessionId, onClose }) => {
  console.log('🔗 ShareLink component rendering!', { sessionId });
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/session/${sessionId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Restaurant Picker Session',
          text: 'Join me to find our perfect restaurant match!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const canNativeShare = navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Share Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Share className="w-5 h-5" />
              <span>Share Link</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Share Instructions</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Send this link to a friend</p>
            <p>• They'll join your restaurant selection session</p>
            <p>• Both of you can start swiping once ready</p>
            <p>• You'll get matched when you both like the same restaurant!</p>
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Session ID: <span className="font-mono">{sessionId}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This session expires in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareLink; 