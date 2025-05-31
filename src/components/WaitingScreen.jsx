import { Users, Share2, CheckCircle, Clock } from 'lucide-react';

const WaitingScreen = ({ session, userId, onMarkReady, onShowShareLink }) => {
  const users = session?.users ? Object.values(session.users) : [];
  const currentUser = users.find(user => user.id === userId);
  const otherUsers = users.filter(user => user.id !== userId);
  const isCurrentUserReady = currentUser?.ready || false;
  const allUsersReady = users.length >= 2 && users.every(user => user.ready);

  // Should show ready button if there are 2+ users and current user isn't ready
  const shouldShowReadyButton = users.length >= 2 && !isCurrentUserReady;

  const getStatusMessage = () => {
    if (users.length < 2) {
      return "Waiting for a friend to join...";
    } else if (!allUsersReady) {
      return "Waiting for everyone to be ready...";
    } else {
      return "Starting session...";
    }
  };

  const getStatusIcon = () => {
    if (users.length < 2) {
      return <Users className="w-16 h-16 text-primary-500 animate-pulse-soft" />;
    } else if (!allUsersReady) {
      return <Clock className="w-16 h-16 text-primary-500 animate-pulse-soft" />;
    } else {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getStatusMessage()}
        </h1>

        {/* Session Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Session Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>ZIP Code: <span className="font-mono font-semibold">{session?.zipCode}</span></p>
              <p>Restaurants: <span className="font-semibold">{session?.restaurants?.length || 0}</span> found</p>
              <p>Rating: <span className="font-semibold">4.2+ stars</span></p>
            </div>
          </div>

          {/* Users Status */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Users ({users.length}/2)
            </h4>
            <div className="space-y-2">
              {/* Current User */}
              <div className="flex items-center justify-between p-2 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">You</span>
                </div>
                <div className="flex items-center space-x-1">
                  {isCurrentUserReady ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600">
                    {isCurrentUserReady ? 'Ready' : 'Not ready'}
                  </span>
                </div>
              </div>

              {/* Other Users */}
              {otherUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Friend {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.ready ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-600">
                      {user.ready ? 'Ready' : 'Not ready'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - users.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Waiting for friend...</span>
                  </div>
                  <Clock className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Always show share button */}
          <button
            onClick={onShowShareLink}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              users.length < 2 
                ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            <Share2 className="w-5 h-5" />
            <span>{users.length < 2 ? 'Share Session Link' : 'Share Link Again'}</span>
          </button>

          {shouldShowReadyButton && (
            <button
              onClick={onMarkReady}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>I'm Ready!</span>
            </button>
          )}

          {users.length >= 2 && isCurrentUserReady && !allUsersReady && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">You're ready! Waiting for others...</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Share the link with a friend</p>
            <p>2. Both mark yourselves as ready</p>
            <p>3. Swipe on restaurant cards</p>
            <p>4. Get matched when you both like the same place!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Session expires in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen; 