import { ToastOptions, ToastPromiseParams, toast } from "react-toastify";

export function validateEmail(email: string): boolean {
  var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  return re.test(email);
}

export function themedPromiseToast(
  promise: Promise<any> | (() => Promise<any>),
  { pending, error, success }: ToastPromiseParams<any, unknown, unknown>,
  options?: ToastOptions<{}> | undefined
) {
  return toast.promise(
    promise,
    {
      pending,
      success,
      error,
    },
    {
      ...options,
      theme:
        localStorage.getItem("usehooks-ts-dark-mode") === "true"
          ? "dark"
          : "light",
    }
  );
}
