const NetworkErrorUI = () => {
  return (
    <div className="  fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-red-600">Network Error</h2>
        <p className=" ">Check Connection</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-buttonColor hover:bg-buttonColorHover text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default NetworkErrorUI;
