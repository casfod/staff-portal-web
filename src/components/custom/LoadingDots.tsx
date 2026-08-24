const LoadingDots = () => (
  <div className="flex space-x-1">
    <span className="w-1 h-1 bg-gray-700 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-1 h-1 bg-gray-700 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-1 h-1 bg-gray-900 rounded-full animate-bounce"></span>
  </div>
);

export default LoadingDots;

/*
import { DotLoader } from 'react-spinners';

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <DotLoader color="#6B7280" size={60} />
  </div>
);


import ReactLoading from 'react-loading';

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <ReactLoading type="bubbles" color="#6B7280" height={60} width={60} />
  </div>
);


import Lottie from 'lottie-react';
import typingAnimation from './typing.json';

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <Lottie animationData={typingAnimation} loop />
  </div>
);

*/
