// import Cookies from "js-cookie";

// const authToken = Cookies.get("jwt");

// export const imageHeader = function (id: string) {
//   const imageKey = id.includes("userAvatar") ? "x-user-id" : "x-product-id";

//   const headers = {
//     [imageKey]: id,
//     "Content-Type": "multipart/form-data",
//     authorization: `Bearer ${authToken}`,
//   };

//   return headers;
// };

import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const imageHeader = function (id: string) {
  const authToken = useSelector((state: RootState) => state.auth.token);

  const imageKey = id.includes("userAvatar") ? "x-user-id" : "x-product-id";

  const headers = {
    [imageKey]: id,
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${authToken}`,
  };

  return headers;
};
