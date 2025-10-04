import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LoadingScreen from '../UI/LoadingScreen';
import Modal from '../UI/Modal';
import Tooltip from '../UI/Tooltip';
import HelpModal from '../UI/HelpModal';
import useKeyboardShortcuts, { createCommonShortcuts } from '../../hooks/useKeyboardShortcuts';

const ComprehensiveTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showLoading, setShowLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Keyboard shortcuts
  const shortcuts = createCommonShortcuts({
    onEscape: () => {
      setShowModal(false);
      setShowHelp(false);
    },
    onHelp: () => setShowHelp(true),
    onEnter: () => setShowModal(true)
  });

  useKeyboardShortcuts({ shortcuts });

  const runTest = (testName: string, testFn: () => boolean) => {
    try {
      const result = testFn();
      setTestResults(prev => ({ ...prev, [testName]: result }));
      return result;
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: false }));
      return false;
    }
  };

  const runAllTests = async () => {
    setShowLoading(true);
    setProgress(0);
    
    const tests = [
      { name: 'Language Switching', fn: () => i18n.language === 'en' || i18n.language === 'he' },
      { name: 'Local Storage', fn: () => typeof localStorage !== 'undefined' },
      { name: 'Session Storage', fn: () => typeof sessionStorage !== 'undefined' },
      { name: 'Geolocation API', fn: () => 'geolocation' in navigator },
      { name: 'Clipboard API', fn: () => 'clipboard' in navigator },
      { name: 'Share API', fn: () => 'share' in navigator },
      { name: 'Service Worker', fn: () => 'serviceWorker' in navigator },
      { name: 'WebRTC', fn: () => 'RTCPeerConnection' in window },
      { name: 'WebSocket', fn: () => 'WebSocket' in window },
      { name: 'IndexedDB', fn: () => 'indexedDB' in window },
      { name: 'Web Audio', fn: () => 'AudioContext' in window || 'webkitAudioContext' in window },
      { name: 'Canvas', fn: () => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
      }},
      { name: 'WebGL', fn: () => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('webgl'));
      }},
      { name: 'Touch Events', fn: () => 'ontouchstart' in window },
      { name: 'Device Orientation', fn: () => 'DeviceOrientationEvent' in window },
      { name: 'Vibration API', fn: () => 'vibrate' in navigator },
      { name: 'Battery API', fn: () => 'getBattery' in navigator },
      { name: 'Network Information', fn: () => 'connection' in navigator },
      { name: 'Permissions API', fn: () => 'permissions' in navigator },
      { name: 'Notification API', fn: () => 'Notification' in window }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async test
      runTest(test.name, test.fn);
      setProgress(((i + 1) / tests.length) * 100);
    }

    setTimeout(() => setShowLoading(false), 500);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const simulateError = () => {
    throw new Error('This is a test error to check ErrorBoundary');
  };

  const testCount = Object.keys(testResults).length;
  const passedCount = Object.values(testResults).filter(Boolean).length;
  const failedCount = testCount - passedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Loading Screen Test */}
      {showLoading && (
        <LoadingScreen
          message="Running comprehensive tests..."
          showProgress={true}
          progress={progress}
        />
      )}

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Test Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Test Modal"
        size="medium"
      >
        <div className="space-y-4">
          <p>This is a test modal to verify modal functionality.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close Modal
            </button>
            <Tooltip content="This button does nothing but shows a tooltip">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Hover for Tooltip
              </button>
            </Tooltip>
          </div>
        </div>
      </Modal>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧪 MULIK Comprehensive Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Test all components, features, and browser compatibility
          </p>
          
          {/* Quick Stats */}
          {testCount > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                ✅ Passed: {passedCount}
              </div>
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                ❌ Failed: {failedCount}
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                📊 Total: {testCount}
              </div>
            </div>
          )}
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {/* Component Tests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎨</span>
              UI Components
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowLoading(true)}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Test Loading Screen
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Test Modal (Enter)
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Test Help Modal (?)
              </button>
              <Tooltip content="This tests tooltip positioning and display">
                <button className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                  Hover for Tooltip
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Feature Tests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              Features
            </h3>
            <div className="space-y-2">
              <button
                onClick={toggleLanguage}
                className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Toggle Language ({i18n.language.toUpperCase()})
              </button>
              <button
                onClick={runAllTests}
                className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Run Browser Tests
              </button>
              <button
                onClick={simulateError}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Test Error Boundary
              </button>
            </div>
          </div>

          {/* Navigation Tests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🧭</span>
              Navigation
            </h3>
            <div className="space-y-2">
              <a
                href="/gametest"
                className="block w-full py-2 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-center"
              >
                Game Page Test
              </a>
              <a
                href="/gameovertest"
                className="block w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-center"
              >
                Game Over Test
              </a>
              <a
                href="/nonexistent"
                className="block w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-center"
              >
                Test 404 Redirect
              </a>
            </div>
          </div>
        </motion.div>

        {/* Test Results */}
        {testCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Browser Compatibility Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(testResults).map(([testName, passed]) => (
                <div
                  key={testName}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="text-sm font-medium">{testName}</span>
                  <span className="text-lg">
                    {passed ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Keyboard Shortcuts Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-blue-50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">⌨️</span>
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>• <kbd className="bg-blue-200 px-2 py-1 rounded">Escape</kbd> - Close modals</div>
            <div>• <kbd className="bg-blue-200 px-2 py-1 rounded">Enter</kbd> - Open test modal</div>
            <div>• <kbd className="bg-blue-200 px-2 py-1 rounded">?</kbd> - Show help</div>
            <div>• <kbd className="bg-blue-200 px-2 py-1 rounded">Space</kbd> - Pause/resume (in game)</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComprehensiveTest;
