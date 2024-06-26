"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FC, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { CitationAction } from "./citation-action";
import { blobFileHandler } from "../../blob-services/blob-file-handler";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
interface SliderProps {
  name: string;
  index: number;
  id: string;
  blobPage: any;
  blobName: any;
  items: any;
}

export const CitationSlider: FC<SliderProps> = (props) => {
  // console.log(props.items)
  const { width, ref } = useResizeDetector()
  const [node, formAction] = useFormState(CitationAction, null);
  const [sasToken, setSasToken] = useState<string | undefined>();
  const page = parseInt(props.items ?? "0");
  useEffect(() => {
    const fetchData = async () => {
      const prop = {
        blobName: props.blobName ?? "",
      };
      const sastoken = await blobFileHandler(prop);
      setSasToken(sastoken);
    };

    fetchData();
  }, []);

  return (
    <div className="flex">
      <form>
        <input type="hidden" name="id" value={props.id} />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="pdfoutline"
              size="sm"
              formAction={formAction}
              type="submit"
              value={22}
            >
              P:{page}
            </Button>
          </SheetTrigger>
          <SheetContent size="LG">
            <SheetHeader>
              <SheetTitle>{props.blobName}</SheetTitle>
            </SheetHeader>
            {/* <div className="text-sm text-muted-foreground">{node}</div> */}
            <div className="flex-1 w-full max-h-screen">
              {sasToken ? (
                <div ref={ref}>
                  <Document file={sasToken} className="max-h-full">
                  <Page pageNumber={page} width={width ? width : 1} />
                </Document>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </form>
    </div>
  );
};
