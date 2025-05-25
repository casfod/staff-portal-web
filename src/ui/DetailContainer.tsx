const DetailContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={`text-sm border border-gray-300 px-6 py-4 rounded-lg shadow-sm isInspect && bg-[#F8F8F8]`}
    >
      {children}
    </div>
  );
};

export default DetailContainer;
