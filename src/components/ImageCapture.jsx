import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const ImageCapture = ({ onCapture, onClose, title = "Take Photo" }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back

  const videoConstraints = {
    facingMode: facingMode
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const saveImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {!capturedImage ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={switchCamera}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Switch Camera
                </button>
                <button
                  onClick={capture}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img src={capturedImage} alt="Captured" className="w-full h-auto" />
              </div>
              
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={retake}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Retake
                </button>
                <button
                  onClick={saveImage}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Photo
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Position camera to capture clear examination image
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCapture;