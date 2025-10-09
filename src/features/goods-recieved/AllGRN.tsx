import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

import {
  useGoodsReceived,
  useDeleteGoodsReceived,
} from "./Hooks/useGoodsReceived";
import { useDispatch, useSelector } from "react-redux";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { RootState } from "../../store/store";
import { BiSearch } from "react-icons/bi";
import { setSearchTerm, setPage } from "../../store/genericQuerySlice";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import { useDebounce } from "use-debounce";
import { GoodsReceivedType } from "../../interfaces";
import { setGoodsReceived } from "../../store/goodsReceivedSlice";
import Spinner from "../../ui/Spinner";
// import { localStorageUser } from "../../utils/localStorageUser";
import TextHeader from "../../ui/TextHeader";
import GRNTableRow from "./GRNTableRow";
import useDeleteRequest from "../../hooks/useDeleteRequest";

export function AllGRN() {
  // const currentUser = localStorageUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const { data, isLoading, isError } = useGoodsReceived({
    search: debouncedSearchTerm,
    sort,
    page,
    limit,
  });

  const { deleteGoodsReceived } = useDeleteGoodsReceived();

  // State for toggling nested tables
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});

  const goodsReceived = useMemo(() => data?.data?.goodsReceived ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  // Toggle nested table visibility
  const toggleViewItems = (id: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (grn: GoodsReceivedType) => {
    dispatch(setGoodsReceived(grn));
    navigate(`/procurement/goods-received/${grn.id}`);
  };

  const handleEdit = (grn: GoodsReceivedType) => {
    dispatch(setGoodsReceived(grn));
    navigate(`/procurement/goods-received/edit/${grn.id}`);
  };

  const handleDelete = useDeleteRequest(deleteGoodsReceived, {
    entityName: "Goods Received Note",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  const tableHeadData = ["GRN Code", "Status", "Items", "Date", "Actions"];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Goods Received Notes</TextHeader>

          {/* <div className="flex items-center gap-3">
            {(currentUser.role === "SUPER-ADMIN" ||
              currentUser.procurementRole.canCreate) && (
              <Button
                onClick={() => navigate("/procurement/goods-received/create")}
              >
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                Create GRN
              </Button>
            )}
          </div> */}
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
            <span className="p-2 text-gray-400">
              <BiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full h-full px-2 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
              placeholder="Search GRNs..."
            />
            <span
              className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
              onClick={() => dispatch(setSearchTerm(""))}
            >
              <GoXCircle />
            </span>
          </div>
        </div>
      </div>

      {/* Goods Received Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-xs 2xl:text-text-sm tracking-wider overflow-x-scroll"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="max-w-full bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={tableHeadData.length} className="py-8">
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : (
              goodsReceived.map((grn) => (
                <GRNTableRow
                  key={grn.id}
                  grn={grn}
                  visibleItems={visibleItems}
                  toggleViewItems={toggleViewItems}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleAction={handleAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(goodsReceived.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
