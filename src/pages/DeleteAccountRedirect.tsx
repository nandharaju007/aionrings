import { useEffect } from "react";

const DeleteAccountRedirect = () => {
  useEffect(() => {
    window.location.replace("/delete-account.html");
  }, []);
  return null;
};

export default DeleteAccountRedirect;
