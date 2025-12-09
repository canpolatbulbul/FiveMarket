import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton={true}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-white text-slate-900 border border-slate-200 shadow-lg",
          title: "text-slate-900 font-semibold",
          description: "text-slate-600",
          actionButton: "bg-indigo-600 text-white hover:bg-indigo-700",
          cancelButton: "bg-slate-200 text-slate-900 hover:bg-slate-300",
          closeButton: "bg-white text-slate-400 hover:text-slate-900 border-slate-200",
          success: "bg-white border-green-200",
          error: "bg-white border-red-200",
          warning: "bg-white border-yellow-200",
          info: "bg-white border-blue-200",
        },
      }}
      {...props} />
  );
}

export { Toaster }
