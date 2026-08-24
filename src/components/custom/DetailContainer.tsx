const DetailContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      // className={`text-sm border border-gray-300 px-6 py-4 rounded-lg shadow-sm isInspect && bg-[#F8F8F8]`}
      className={`text-sm border border-gray-300 py-6 px-3 md:px-6 lg:px-16 rounded-lg shadow-sm isInspect && bg-[#F8F8F8]`}
    >
      {children}
    </div>
  );
};

export default DetailContainer;
