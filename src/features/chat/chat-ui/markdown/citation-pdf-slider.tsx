import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FC, useEffect, useState } from "react";
import { blobFileHandler } from "../../blob-services/blob-file-handler";

interface PDFSliderProps {
  blobName: string | undefined;
  blobPage: string | undefined;
}

export const CitationPDFSlider: FC<PDFSliderProps> = (props) => {
  const [sasToken, setSasToken] = useState<string | undefined>();
  const page = parseInt(props.blobPage ?? "0") + 1;
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
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default" size="sm" type="submit" value={22}>
            PDF
          </Button>
        </SheetTrigger>
        <SheetContent size="LG">
          <SheetHeader>
            <SheetTitle>{props.blobName}</SheetTitle>
          </SheetHeader>
          <div>
            {sasToken ? (
              <iframe
                src={`${sasToken}#page=${page}`}
                width="650px"
                height="900px"
                allowFullScreen
              ></iframe>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
