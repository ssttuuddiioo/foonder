import { useState } from 'react';
import { Users, Share2, CheckCircle, Clock, Copy, Check, Heart, MapPin } from 'lucide-react';

const WaitingScreen = ({ session, userId, onMarkReady }) => {
  const [copied, setCopied] = useState(false);
  
  const users = session?.users ? Object.values(session.users) : [];
  const currentUser = users.find(user => user.id === userId);
  const otherUsers = users.filter(user => user.id !== userId);
  const isCurrentUserReady = currentUser?.ready || false;
  const allUsersReady = users.length >= 2 && users.every(user => user.ready);

  const shouldShowReadyButton = users.length >= 2 && !isCurrentUserReady;
  const shareUrl = `${window.location.origin}/session/${session?.id}`;

  // Determine if this user is the session creator (first user to join)
  const isSessionCreator = users.length > 0 && users[0]?.id === userId;

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

  const getMainMessage = () => {
    if (isSessionCreator) {
      if (users.length < 2) {
        return "Share the link to get started";
      } else if (!allUsersReady) {
        return "Ready to find your match?";
      } else {
        return "Starting your session...";
      }
    } else {
      // Message for people joining via link
      if (!isCurrentUserReady) {
        return "Ready to find some great food?";
      } else if (!allUsersReady) {
        return "Waiting for your friend...";
      } else {
        return "Starting your session...";
      }
    }
  };

  const getSubMessage = () => {
    if (isSessionCreator) {
      if (users.length < 2) {
        return "Send this link to a friend and start swiping together";
      } else if (!allUsersReady) {
        return "Both of you need to mark ready to begin";
      } else {
        return "Loading restaurants...";
      }
    } else {
      // Message for people joining via link
      if (!isCurrentUserReady) {
        return `Somebody wants to meet up and eat some good food with you around ${session?.zipCode || 'this area'}. When you're ready, hit 'Ready' and remember to match the restaurants you like!`;
      } else if (!allUsersReady) {
        return "Waiting for your friend to get ready...";
      } else {
        return "Loading restaurants...";
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-red-500 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getMainMessage()}
          </h1>
          <p className="text-base text-gray-600">
            {getSubMessage()}
          </p>
        </div>

        {/* Session Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-4">
          {/* Location Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-xl">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-semibold text-gray-900">{session?.zipCode || 'Your Location'}</p>
              <p className="text-sm text-gray-600">{session?.restaurants?.length || 0} restaurants found • 4.2+ stars</p>
            </div>
          </div>

          {/* Share Link Section - Only show to session creator */}
          {isSessionCreator && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Share with a friend</h3>
                <span className="text-sm text-red-600 font-medium">👫 {users.length}/2 joined</span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                    copied
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Done!</span>
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
          )}

          {/* Welcome message for link joiners */}
          {!isSessionCreator && users.length >= 2 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-1">How this works</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• You'll both swipe through restaurant cards</p>
                <p>• Swipe right (❤️) for places you'd like to try</p>
                <p>• Swipe left (✕) for places you'll skip</p>
                <p>• When you both like the same place, it's a match!</p>
              </div>
            </div>
          )}

          {/* Users Status */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">Participants</h4>
            
            {/* Current User */}
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-900 text-sm">You</span>
              </div>
              <div className="flex items-center gap-1">
                {isCurrentUserReady ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Ready</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Not ready</span>
                  </>
                )}
              </div>
            </div>

            {/* Other Users */}
            {otherUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 text-sm">Friend {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  {user.ready ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Ready</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Not ready</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {users.length < 2 && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500 text-sm">Waiting for friend...</span>
                </div>
                <Share2 className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>

          {/* Ready Button */}
          {shouldShowReadyButton && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={onMarkReady}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>I'm Ready to Swipe!</span>
              </button>
            </div>
          )}

          {/* Waiting Message */}
          {users.length >= 2 && isCurrentUserReady && !allUsersReady && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">You're ready! Waiting for others...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Sessions expire after 24 hours • No personal data stored
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen; 